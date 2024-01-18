import {order_db} from "../db/db.js";

const loadtTable = () =>{
    $("#order-history-section tbody").html("");
    order_db.map(order => {
        $("#order-history-section tbody").append(`
            <tr>
                <td>${order.id}</td>
                <td> ${order.date} </td>
                <td> ${order.customer} </td>
                <td> ${order.items.length}  </td>
                <td> ${order.discount} </td>
                <td> ${order.total} </td>
            </tr>
        `);
    });
};

const getAllOrders = () => {
    var settings = {
        "url": "http://localhost:8081/pos/OrderModel",
        "method": "GET",
        "timeout": 0,
    };

    $.ajax(settings).done(function (response) {
        // console.log(response);
        order_db.splice(0, order_db.length)
        response.map(ordr => {
            order_db.push(ordr);
        })
    });
}

getAllOrders();
$("#history-order-btn").on('click', ()=>{
    getAllOrders()
    loadtTable();

})

//table row action
$("#order-history-section tbody").on('click', 'tr', function (){
    let selectedId = $(this).find("td:nth-child(1)").text();

    let index = order_db.findIndex(order => order.id === selectedId);

    if(index == -1) return;

    let details = "";
    order_db[index].items.map((item) => {
        details += item.id + " - " + item.name + "\n";
    });

    Swal.fire(details);
});