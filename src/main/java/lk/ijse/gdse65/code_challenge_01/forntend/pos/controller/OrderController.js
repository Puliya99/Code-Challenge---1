import {OrderModel} from "../model/OrderModel.js";
import {customer_db} from "../db/db.js";
import {item_db} from "../db/db.js";
import {order_db} from "../db/db.js";
import {ItemModel} from "../model/ItemModel.js";

let cusRowIndex = null;
let itemRowIndex = null;
let total = 0;
let subTotal = 0;
let sum = 0;
let tempItems = [];
let addedItems = [];

const loadAddItemData = ()=>{
    $("#orderedItemTBody").html("");
    addedItems.map((item) => {
        $("#orderedItemTBody").append(`
                    <tr>
                        <td> ${item.id} </td>
                        <td> ${item.name} </td>
                        <td> ${item.price} </td>
                        <td> ${item.qty} </td>
                        <td> ${item.price * item.qty} </td>
                    </tr>
    `   );
    })
}

const loadIdDate = () =>{
    if(customer_db.length == 0){
        $("#orderId").val("OD001");
    }else{
        $("#orderId").val(generateNewId(order_db[order_db.length - 1].id));
    }

    $("#date").val(new Date().toLocaleDateString('en-GB'));
};

loadIdDate();

//lode customer to combobox
 export const loadCustomers = () => {

    $("#orderCusId").empty();
    customer_db.map((orderCusId) => {
        $("#orderCusId").append(`<option value="${orderCusId.id}">${orderCusId.id}</option>`);
    });
};

//lode Items to combobox
 export const loadItems = () => {

    $("#orderItemId").empty();
    item_db.map((orderItemId) => {
        $("#orderItemId").append(`<option value="${orderItemId.id}">${orderItemId.id}</option>`);
    });
};

//setCustomerDetails
$("#customerSelector").on('click','select', function (){
    cusRowIndex = customer_db.findIndex(customer => customer.id === $(this).val());
    if(cusRowIndex === -1) return;
    $("#orderCusName").val( customer_db[cusRowIndex].name );
    $("#orderCusAddress").val( customer_db[cusRowIndex].address );
    $("#orderCusContact").val( customer_db[cusRowIndex].contact );
});

//setItemDetails
$("#itemSelector").on('click','select', function (){
    itemRowIndex = item_db.findIndex(item => item.id === $(this).val());
    if(itemRowIndex == -1) return;
    $("#orderItemName").val( item_db[itemRowIndex].name );
    $("#orderItemPrice").val( item_db[itemRowIndex].price );
    $("#qty-on-hand").val( item_db[itemRowIndex].qty );
});

//add-item action
$("#add-item-btn").on('click', ()=>{
    let id = $("#orderItemId").val(),
        name = $("#orderItemName").val(),
        price = Number.parseFloat($("#orderItemPrice").val()),
        qty = Number.parseInt($("#orderItemQty").val()),
        itemTotal = price * qty;

    if(qty > item_db[itemRowIndex].qty || !qty) {
        showErrorAlert("Please enter a valid qty..Need to be lower than or equal to qty on hand");
        return;
    }

    let existingItem = addedItems.findIndex(item => item.id === id);
    console.log("index : " + existingItem);

    if(existingItem < 0){
        addedItems.push(new ItemModel(id, name, price, qty, itemTotal));
    }else {
        addedItems[existingItem].qty += qty;
    }
    loadAddItemData();

    tempItems.push(item_db[itemRowIndex]);
    item_db[itemRowIndex].qty -= qty;
    $("#qty-on-hand").val( item_db[itemRowIndex].qty );
    sum += itemTotal;
    $("#sum").text(`Total: Rs. ${sum}`);
});


//show balance
$("#cash").on('input', ()=>{
    console.log(Number.parseFloat($("#cash").val()));
    console.log(Number.parseFloat($("#subTotal").text().slice(15)));
    $("#balance").val(Number.parseFloat($("#cash").val()) - Number.parseFloat($("#subTotal").text().slice(15)));
})

$("#discount").on('input', () => {
    let subTotals = Number.parseFloat($("#sum").text().slice(11)); // Extract the Sub Total value
    let discount = Number.parseFloat($("#discount").val()) || 0; // Get the discount input value (default to 0 if not a valid number)
    let discountedTotal = subTotals - (subTotals * discount / 100); // Calculate the discounted total
    $("#subTotal").text(`Sub Total: Rs. ${discountedTotal.toFixed(2)}`); // Update the Total with the discounted value
});
//save order
$("#order-btn").on('click', ()=>{
    sum =0;

    let orderId = $("#orderId").val(),
        date = $("#date").val(),
        customer = $("#orderCusId").val(),
        items = addedItems,
        total = Number.parseFloat($("#subTotal").text().slice(15)),
        discount = Number.parseFloat($("#discount").val());

    if(checkValidation(orderId, date, customer, items, total, discount)){
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Place Order!'
        }).then((result) => {
            if (result.isConfirmed) {

                let order = new OrderModel(orderId, date, customer, items, discount, total);
                var settings = {
                    "url": "http://localhost:8081/pos/OrderModel",
                    "method": "POST",
                    "timeout": 0,
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "data": JSON.stringify(order),
                };

                $.ajax(settings).done(function (response) {
                    if(response == 'saved'){
                        order_db.push(order);
                        $("balance").val(Number.parseFloat($("#cash").val()) - total);
                        $("#order-section form").trigger('reset');
                        $("select").val("");
                        loadIdDate();
                        addedItems = [];
                        loadAddItemData();
                        Swal.fire(
                            `Rs: ${total}`,
                            'The Order has been placed!',
                            'success'
                        )
                    }else {
                        showErrorAlert('Order Not Saved');
                    }
                });
            }
        })
    }

    $("#subTotal").text('SubTotal: Rs.000.00');
    $("#sum").text('Total: Rs.000.00');
});

//cancel order
$("#cancel-order-btn").on('click', ()=>{
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Cancel the order!'
    }).then((result) => {
        if (result.isConfirmed) {

            addedItems.map((addedItem) =>{
                let i = item_db.findIndex(item => item.id === addedItem.id);
                item_db[i].qty += addedItem.qty;
            });

            $("#order-section form").trigger('reset');
            $("select").val("");;
            $("#subTotal").text('SubTotal: Rs.000.00');
            $("#sum").text('Total: Rs.000.00');
            addedItems = [];
            loadAddItemData();

            Swal.fire(
                `Canceled`,
                'The Order has been canceled!',
                'success'
            )
        }
    })
})

//check validations
function checkValidation(orderId, date, customer, items, total, discount) {
    if(!customer){
        showErrorAlert("Please select a customer to place order");
        return false;
    }
    if(items.length == 0){
        showErrorAlert("Please select a item/items to place order");
        return false;
    }
    if(!$("#cash").val()){
        showErrorAlert("Please enter the cash amount");
        return false;
    }
    if((Number.parseFloat($("#cash").val()) - total) < 0){
        showErrorAlert("The cash is not enough to pay the order!!!");
        return false;
    }
    return true;
}

//generateNewID
function generateNewId(lastId) {
    const lastNumber = parseInt(lastId.slice(2), 10);
    const newNumber = lastNumber + 1;
    const newId = "OD" + newNumber.toString().padStart(3, "0");
    return newId;
}

//showErrorAlert
function showErrorAlert(message){
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
    });
}