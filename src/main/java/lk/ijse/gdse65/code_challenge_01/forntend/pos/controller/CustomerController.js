import {CustomerModel} from "../model/CustomerModel.js";
import {customer_db} from "../db/db.js";

var row_index = null;

const loadId = () =>{
    if (customer_db.length == 0){
        $("#cusId").val("C001");
    }else{
        $("#cusId").val(generateNewId(customer_db[customer_db.length - 1].id));
    }
};

loadId();

const getAllCustomers = () => {
    var settings = {
        "url": "http://localhost:8081/pos/CustomerModel",
        "method": "GET",
        "timeout": 0,
    };

    $.ajax(settings).done(function (response) {
        response.map(cus => {
            customer_db.push(cus);
        })
        loadId();
    });
}
getAllCustomers();

const loadCustomerData = () => {
    $('#cusTable').html(""); // make tbody empty
    customer_db.map((customer) => {
        $("#cusTable").append(`<tr><td>${customer.id}</td><td>${customer.name}</td><td>${customer.address}</td><td>${customer.contact}</td></tr>`);
    });
};



$(".customer").on('click', ()=> loadCustomerData());

// submit
$("#save").on('click', () => {
    let id = $("#cusId").val(),
        name = $("#cusName").val(),
        address = $("#cusAddress").val(),
        contact = $("#cusContact").val();

    if(-1 != customer_db.findIndex(cus => cus.id === id)){
        showErrorAlert(`ID ${id} is already exist!`);
        return;
    }
    if(!checkValidation(id, name, address, contact)) return;

    let customer = new CustomerModel(id, name, address, contact);

    const custJSON = JSON.stringify(customer);

    const sendAjax = (customerJSON) => {
        $.ajax({
            url: "http://localhost:8081/POS/CustomerModel",
            type: "POST",
            data: customerJSON,
            contentType: "application/json",
            success: function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Customer Saved Successful',
                    showConfirmButton: false,
                    timer: 1500
                })
            },
            error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Please Check Text Field',
                    text: 'Something went wrong!'
                })
            }
        });
    };
    sendAjax(custJSON);
});

//search
$("#cusTable").on('click', "tr", function(){
    let selectedId = $(this).find("td:nth-child(1)").text();

    $("#cusId").val(selectedId);
    $("#cusName").val($(this).find("td:nth-child(2)").text());
    $("#cusAddress").val($(this).find("td:nth-child(3)").text());
    $("#cusContact").val($(this).find("td:nth-child(4)").text());

    row_index = customer_db.findIndex((customer => customer.id == selectedId));
});

// update
$("#update").on('click', () => {
    let id = $("#cusId").val(),
        name = $("#cusName").val(),
        address = $("#cusAddress").val(),
        contact = $("#cusContact").val();

    if(!checkValidation(id, name, address, contact)) return;

    let customerModel = new CustomerModel(id, name, address, contact);
    let settings = {
        "url": "http://localhost:8081/pos/CustomerModel",
        "method": "PUT",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(customerModel),
    };
    $.ajax(settings).done(function (response) {
        if(response == 'updated'){
            customer_db[row_index].id = id;
            customer_db[row_index].name = name;
            customer_db[row_index].address = address;
            customer_db[row_index].contact = contact;
            loadCustomerData();
            $("#reset").click();
            loadId();
            row_index = null;
            Swal.fire({
                icon: 'success',
                title: 'Customer has been updated',
                showConfirmButton: false,
                timer: 1500
            })
        }else{
            showErrorAlert('Customer Not Updated');
        }
    });
});

// delete
$("#delete").on('click', () => {
    if (row_index == null) return;
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete customer!'
    }).then((result) => {
        if (result.isConfirmed) {

            var settings = {
                "url": `http://localhost:8081/pos/CustomerModel?id=${$("#cusId").val()}`,
                "method": "DELETE",
                "timeout": 0,
            };

            $.ajax(settings).done(function (response) {
                if(response == 'deleted'){
                    customer_db.splice(row_index, 1);
                    loadCustomerData();
                    $("#reset").click();
                    loadId();
                    Swal.fire(
                        'Deleted!',
                        'Customer has been deleted.',
                        'success'
                    )
                }else{
                    showErrorAlert('Customer Not Deleted');
                }
            });
        }
    })
});

//validation
function checkValidation(id, name, address, contact){
    if(!/^C\d{3}$/.test(id)){ //chekc ID
        showErrorAlert("Please enter a valid ID!")
        return false;
    }
    if(!/^[A-Za-z.\s]+$/.test(name)){ //check name
        showErrorAlert("Please enter a valid name!");
        return false;
    }
    if(!/^[A-Za-z0-9,/.\s]+$/.test(address)){ //check address
        showErrorAlert("Please enter a valid address!");
        return false;
    }
    if(!/^\d{10}$/.test(contact)){ //check address
        showErrorAlert("Please enter a valid Contact!");
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
    const newId = "C" + newNumber.toString().padStart(3, "0");
    return newId;
}

$("#reset").on('click', ()=>{
    setTimeout(loadId, 10);
})
