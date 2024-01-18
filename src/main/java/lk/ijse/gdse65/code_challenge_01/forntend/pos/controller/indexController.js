import {loadCustomers} from "../controller/OrderController.js";
import {loadItems} from "../controller/OrderController.js";

const displayNoneSections = () => {
    $("#dashboard-section").css("display", "none");
    $("#stores-section").css("display", "none");
    $("#customer-section").css("display", "none");
    $("#item-section").css("display", "none");
    $("#order-section").css("display", "none");
    $("#order-history-section").css("display", "none");
}

displayNoneSections();
$("#dashboard-section").css("display", "block");

$("#dashboard").on('click', () => {
    displayNoneSections();
    $("#dashboard-section").css("display", "block");
});

$("#store").on('click', () => {
    displayNoneSections();
    $("#stores-section").css("display", "block");
});

$("#customer").on('click', () => {
    displayNoneSections();
    $("#customer-section").css("display", "block");
});

$("#item").on('click', () => {
    displayNoneSections();
    $("#item-section").css("display", "block");
});

$("#order").on('click', () => {
    loadCustomers();
    loadItems();
    displayNoneSections();
    $("#order-section").css("display", "block");
});

$("#history-order-btn").on('click', () => {
    displayNoneSections();
    $("#sectionName").text("Order History");
    $("#order-history-section").css("display", "block");
});
