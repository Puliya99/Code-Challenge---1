import {ItemModel} from "../model/ItemModel.js";
import {item_db} from "../db/db.js";

let row_index = null;

const loadId = () =>{
    if(item_db.length == 0){
        $("#itemId").val("I001");
    }else{
        $("#itemId").val(generateNewId(item_db[item_db.length - 1].id));
    }
};

loadId();

const getAllItems = () => {
    var settings = {
        "url": "http://localhost:8081/pos/ItemModel",
        "method": "GET",
        "timeout": 0,
    };

    $.ajax(settings).done(function (response) {
        response.map(itm => {
            item_db.push(itm);
        })
        loadId();
    });
}
getAllItems();

const loadItemData = () => {
    $("#itemTable").html("");
    item_db.map((item) => {
        $("#itemTable").append(`<tr><td>${item.id}</td><td>${item.name}</td><td>${item.price}</td><td>${item.qty}</td></tr>`);
    });
};

$(".item").on('click', ()=> loadItemData());

//save
$("#item_save").on('click', () => {
    let id = $("#itemId").val(),
        name = $("#itemName").val(),
        price = Number.parseFloat($("#itemPrice").val()),
        qty = Number.parseInt($("#itemQty").val());

    if(-1 != item_db.findIndex(item => item.id === id)){
        showErrorAlert(`ID ${id} is already exist!`);
        return;
    }
    if(!checkValidation(id, name, price, qty)) return;

    let item = new ItemModel(id, name, price, qty);
    var settings = {
        "url": "http://localhost:8081/pos/ItemModel",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(item),
    };

    $.ajax(settings).done(function (response) {
        if(response == 'saved'){
            item_db.push(item);
            loadItemData();
            $("#item-reset").click();
            loadId();
            Swal.fire({
                icon: 'success',
                title: 'Item has been saved',
                showConfirmButton: false,
                timer: 1500
            })
        }else{
            showErrorAlert("Item Not Saved");
        }
    });
});

//search
$("#itemTable").on('click', "tr", function(){
    let selectedId = $(this).find("td:nth-child(1)").text();

    $("#itemId").val( selectedId );
    $("#itemName").val( $(this).find("td:nth-child(2)").text() );
    $("#itemPrice").val( Number.parseFloat($(this).find("td:nth-child(3)").text() ) );
    $("#itemQty").val( Number.parseInt( $(this).find("td:nth-child(4)").text() ) );

    row_index = item_db.findIndex((item => item.id == selectedId));
});

//update
$("#item_update").on('click', () => {
    let id = $("#itemId").val(),
        name = $("#itemName").val(),
        price = Number.parseFloat($("#itemPrice").val()),
        qty = Number.parseInt($("#itemQty").val());

    if(!checkValidation(id, name, price, qty)) return;

    let item = new ItemModel(id, name, price, qty);
    var settings = {
        "url": "http://localhost:8081/pos/ItemModel",
        "method": "PUT",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(item),
    };

    $.ajax(settings).done(function (response) {
        if(response == 'updated'){
            item_db[row_index].code = id;
            item_db[row_index].name = name;
            item_db[row_index].price = price;
            item_db[row_index].qty = qty;
            loadItemData();
            $("#item-reset").click();
            row_index = null;
            loadId();
            Swal.fire({
                icon: 'success',
                title: 'Item has been updated',
                showConfirmButton: false,
                timer: 1500
            })
        }else {
            showErrorAlert('Item Not Updated');
        }
    });
});

//remove
$("#item_delete").on('click', () => {
    if (row_index == null) return;
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            var settings = {
                "url": `http://localhost:8081/pos/ItemModel?id=${$("#itemId").val()}`,
                "method": "DELETE",
                "timeout": 0,
            };
            $.ajax(settings).done(function (response) {
                if(response == 'deleted'){
                    item_db.splice(row_index, 1);
                    loadItemData();
                    $("#item-reset").click();
                    loadId();
                    Swal.fire(
                        'Deleted!',
                        'Item has been deleted.',
                        'success'
                    )
                }else{
                    showErrorAlert('Item Not Deleted');
                }
            });
        }
    })
});

//validation
function checkValidation(id, name, price, qty){
    if(!/^I\d{3}$/.test(id)){
        showErrorAlert("Please enter a valid ID!")
        return false;
    }
    if(!/^[A-Za-z./0-9-–\s]+$/.test(name)){
        showErrorAlert("Please enter a description!");
        return false;
    }
    if(!/^\d+(\.\d{1,2})?$/.test(price.toString())){
        showErrorAlert("Please enter a price for item!");
        return false;
    }
    if(!qty || qty == 0){
        showErrorAlert("Please enter a quantity");
        return false;
    }
    return true;
}

//showErrorAlert
function showErrorAlert(message){
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
    });
}

//generateNewID
function generateNewId(lastId) {
    const lastNumber = parseInt(lastId.slice(1), 10);
    const newNumber = lastNumber + 1;
    const newId = "I" + newNumber.toString().padStart(3, "0");
    return newId;
}

$("#item_reset").on('click', ()=>{
    setTimeout(loadId, 10);
})