/**
 * not restoring the cart in database
 * whenever creat a cart,pass the old cart(initItems) into it,the old cart items will be 
 * assigned to new items,it was able to check if new item where the key is ID if they already
 * added to the cart
 */

module.exports = function Cart(oldCart) {
    /**
     * --------For the entire shopping cart---------
     * get old cart created every creator 
     * old cart items will be undefined instead of an empty object,so it need a initialize 
     * object {}
     * use the operator,either do this but if this is undefine
     */
    this.items = oldCart.items || {};
    this.totalQuantity = oldCart.totalQuantity || 0;
    this.totalPrice = oldCart.totalPrice || 0;
    /**
     * --------For a single product--------
     * Add a new item,get the item and the ID of this item
     * it will always expand the cart with each new item added,to resolve this problem,need 
     * group the same items
     * 
     * aggregated the information not just individual information of each items,can't just push
     * items on an array,it will lead to shopping cart might have such a list of same items
     * 
     * access the cart whenever added a new item,will take the old cart and creat a new cart 
     * off this old cart,be able to check if a certain product ID already exists in this cart
     * if true,then just update the quantity of this items,instead to push a new product in it
     * @param {*} item 
     * @param {*} id 
     */
    this.add = function (item, id) {
        var storedItem = this.items[id];
        //console.log(storedItem);
        /**
         * check if this product group already exists
         * if the user first time shopping,storeItem will be undefine
         * storedItem will store the product information from the database for this id
         */
        if (!storedItem)
            storedItem = this.items[id] = {
                item: item,
                quantity: 0,
                price: 0
            };
        /**
         * creat a new entry and give it a key to be the product ID,and also assigning it 
         * to the storedItem
         * 
         * it need to be an object because items here are store with a key being the 
         * product ID
         * an array would not allow to do this
         * 
         * quantity and price should be 0 because will increment it in next step
         */

        storedItem.quantity++;
        storedItem.price = storedItem.item.price * storedItem.quantity;
        this.totalQuantity++;
        this.totalPrice += storedItem.item.price;
    }
    /**
     * 
     * @param {*} id 
     */
    this.reduceByOne = function (id) {
        this.items[id].quantity--;
        //reduce the price of one single item in individual item price
        this.items[id].price -= this.items[id].item.price;
        this.totalQuantity--;
        this.totalPrice -= this.items[id].item.price;

        /**
         * in the case of here,check if the quantity is equal to or small than zero in which case need to remove this item
         * not just reduse its anymore,Otherwise, both the quantity and the price will become negative
         */
        if (this.items[id].quantity <= 0)
            delete this.items[id];
    }
    /**
     * 
     * @param {*} id 
     */
    this.removeItem = function (id) {
        /**
         * reduce items entirely by whatever quantity you had
         */
        this.totalQuantity -= this.items[id].quantity;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    }

    /**
     * transform into an array if want to output it in a list
     */
    this.generateArray = function () {
        var arr = [];
        for (var id in this.items)
            arr.push(this.items[id]);
        return arr;
    }
}