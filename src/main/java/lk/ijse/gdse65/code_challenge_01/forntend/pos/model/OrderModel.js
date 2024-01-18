export class OrderModel {
    constructor(id, date, customer, items, discount, total) {
        this.id = id;
        this.date = date;
        this.customer = customer;
        this.items = items;
        this.discount = discount;
        this.total = total;
    }
}
