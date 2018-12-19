(function () {
    //屠龙0.0.3  版权归 “潮目 - Hypeeyes”所有，未经授权不得转发

    let categories = ["Jackets", "Coats", "Shirts", "Tops/Sweaters", "Sweatshirts", "Pants", "Shorts", "T-Shirts", "Hats", "Bags", "Accessories", "Shoes", "Skate", "new"];
    // 0 -> "Jackets", 1 -> "Coats", 2-> "Shirts", 3 -> "Tops/Sweaters", 4 ->"Sweatshirts", 5->"Pants", 6->"Shorts", 7->"T-Shirts",
    //8-> "Hats", 9->"Bags", 10->"Accessories", 11->"Shoes", 12->"Skate"

    let items = [
        {
            keyWords: "+tagless, +tee",
            category: categories[10],
            preferredSize: "any",
            preferColor: "any"
        },
        {
            keyWords: "+Jesus, +Mary",
            category: categories[4],
            preferredSize: "any",
            preferColor: "any"
        },
        {
            keyWords: "+supreme, +ny",
            category: categories[8],
            preferredSize: "any",
            preferColor: "any"
        },
    ];

    let autoCheckout = false; // 自动结账，
    let checkout_delay = 1500; // 结账延迟设置， 2500 = 2.5秒
    let monitor_delay = 1000; // 刷新延迟
    let restock_monitor_delay = 1000; // 补货延迟 1000 = 1秒
    let form_fill_delay = 40; // 填表格延迟

    //Address info
    let area = "USA"; // "CANADA", "other"
    let billing_name = "us last";
    let order_email = "test@gmail.com";
    let order_tel = "1112223344";
    let order_address = "707 test St";
    let order_billing_address_2 = "Apt48";
    let order_billing_zip = "95116";
    let order_billing_city = "San Jose";
    let order_billing_state = "CA";  // 日本省份前面要加空格，
    let order_billing_country = "USA"; // USA, CANADA，EU:GB, FR  欧洲国家大写缩写

    //Payment info
    let credit_card_type = "cod"; // 日本代金填cod
    // 欧洲：visa, american_express, master, solo 
    // 日本：visa, american_express, master, jcb, cod(代金)
    let cnb = "4111 1111 1111 1111";
    let month = "10";
    let year = "2022";
    let vval = "119";

    //=======================================================================================================

    let startTime = null;
    let item_selected = false;
    let products = null;
    let domItemIndex = 0;
    let add_requests = [];

    let mobile_stock_api = "https://www.supremenewyork.com/mobile_stock.json";
    let event = document.createEvent('Event');
    event.initEvent('change', true, true); 

    let notifyHeader = document.createElement('p');
    notifyHeader.style.cssText = "padding-left:120px;margin: auto;width: 100%;background-color: #70de4c;";
    let refresh_count = 0;
    document.getElementsByTagName('header')[0].appendChild(notifyHeader);

    async function retryFetch (url, options=null, retry=0) {
        if (retry >= 4) return Promise.resolve(1);
        let res = await fetch(url, options);
        if (res.status !== 200) {
            await sleep(Math.min(retry * 500, 2 * 1000));
            return await retryFetch(url, options, retry + 1);
        } else {
            return await res.json();
        }
    }

    function matchKeyWord (itemName, keyWords) {
        let name = itemName.toLowerCase().trim();
        let keyWordsList = keyWords.toLowerCase().split(",");
        for (let i = 0; i < keyWordsList.length; i ++) {
            let word = keyWordsList[i].trim();
            if ((word.includes('+') && !name.includes(word.substr(1))) ||
                (word.includes('-') && name.includes(word.substr(1)))) {
                return false;
            }
        }
        return true;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function mobileAPIRefreshed(respond) {
        if (respond['products_and_categories'] == null || respond['products_and_categories']['new'] == null) {
            return false;
        }
        products = respond['products_and_categories'];
        for (let i = 0; i < items.length; i ++) {
            let category = items[i]['category'];
            let categoryProduct = products[category];
            if (categoryProduct !== undefined) {

                for (let index = 0; index < categoryProduct.length; index++) {
                    let item = categoryProduct[index];
                    for (let j = 0; j < items.length; j++) {
                        if (itemNameMatch(item, items[j])) {
                            domItemIndex = j;
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    function itemNameMatch(item, wantedItem) {
        console.log(item['name'] + ' : ' + wantedItem['keyWords'])
        return item != null && item['name'] != null && matchKeyWord(item['name'], wantedItem['keyWords'])
    }

    async function monitor() {
        if (!item_selected) {
            notifyHeader.innerHTML = '监测新的产品。。。 次数： ' + refresh_count;
            refresh_count ++;
                
            let respond = await retryFetch(mobile_stock_api);
            console.error('hi')
            let refreshed = respond == null ? false : await mobileAPIRefreshed(respond);
            if (refreshed) {
                //parsedProducts = await getItemsInfo();
                startTime = new Date();
                let category = items[domItemIndex].category;
                console.warn("Detect Page refreshed with mobile endpoint at: " + startTime.toISOString());
                notifyHeader.innerHTML = "新商品已经上线。。。如果页面没有跳转到商品页面请手动刷新并且重启程序。";
                window.location.href = 'https://www.supremenewyork.com/mobile/#categories/' + category;
                await sleep(300);
                start();
            } else {
                console.log("Not refreshed, retrying ...");
                await sleep(monitor_delay);
                await monitor();
            }
        }
    }


    function start() {
        let listed_items = document.getElementsByClassName("name");
        let selectedItem = null;
        if (listed_items.length > 0) {
            notifyHeader.innerHTML = "寻找相应物品中。。。如有卡顿，请手动点击商品图片。";
            for (let item of listed_items) {
                let name = item.innerHTML;

                if (matchKeyWord(name, items[domItemIndex].keyWords)) {
                    startTime = new Date().getTime();
                    selectedItem =item;
                    selectedItem.click();
                    break;
                }
            }//

            if (selectedItem !== null) {
                (function waitTillItemClick() {
                    listed_items = document.getElementsByClassName("name");
                    if (listed_items.length > 0) {
                        console.log('wait item click ...');
                        selectedItem.click();
                        setTimeout(function(){ waitTillItemClick(); }, 150);
                    }
                })();
            } else {
                sleep(50).then(start);
            }
        } else {
            sleep(150).then(start);
        }
    }

    (function waitTillArticlePageIsOpen() {
        console.log('wait item page ...');
        let atcBtn = document.getElementsByClassName("cart-button")[0];
        if (atcBtn) {
            addToCart();
        } else {
            setTimeout(function(){ waitTillArticlePageIsOpen(); }, 150);
        }
    })();



    async function addToCart () {
        if (document.getElementById('cart-update').children[0].innerHTML === "remove") {
            checkout();
            return;
        }
        notifyHeader.innerHTML = "选择相应颜色中。。。";
        await chooseColor(0);
        notifyHeader.innerHTML = "颜色选择完毕。。。";
        await sleep(70);
        notifyHeader.innerHTML = "选择相应尺码中。。。";
        chooseSize();
        notifyHeader.innerHTML = "尺码选择完毕。。。";
        await sleep(70);
        let atcBtn = document.getElementsByClassName("cart-button")[0];
        atcBtn.click();
        item_selected = true;
        
        (function waitTillCartUpdates() {
            let cart = document.getElementById("goto-cart-link").innerHTML;
            if (cart == '' || cart == 0) {
                setTimeout(function(){ waitTillCartUpdates(); }, 150);
            } else {
                notifyHeader.innerHTML = "已经加入购物车";
                checkout();
            }
        })();
    }


    async function chooseColor(times) {
        let image;
        let url = "/shop/"+window.location.hash.split("/")[1]+".json";
        let res = await fetch(url);
        let myJson = await res.json();
        for (let item of myJson['styles']){
            let color = item.name;
            if (checkAvailability(item.sizes)) {
                let id = item.id;
                let imageID = "style-"+id;
                image = document.getElementById(imageID).getElementsByClassName("style-thumb")[0]; 
                if (items[domItemIndex].preferColor.toLowerCase() === 'any' || color.toLowerCase().includes(items[domItemIndex].preferColor.toLowerCase())) {
                    image.click();
                    break;
                }
            }
        }
        if (image !== undefined) {
            image.click();
        } else {
            notifyHeader.innerHTML = "商品已卖完, 补货模式中: " + times;
            await sleep(restock_monitor_delay);
            await chooseColor(times + 1);
        }
    }

    function checkAvailability(sizes) {
        for (let size of sizes) {
            if (size['stock_level'] > 0) {
                return true;
            }
        }
        return false;
    }

    function chooseSize(){
        let sizeOpts = document.getElementsByTagName("option");
        let sizeVal = sizeOpts[0].value;
        for (let option of sizeOpts){
            let size = option.text.toLowerCase();
            if (size === items[domItemIndex].preferredSize.toLowerCase() || size === 'N/A'){
                sizeVal =  option.value;
                break;
            }
        }
        document.getElementsByTagName("select")[0].value = sizeVal;
    }

    async function checkout(){
        await addExtraItemByRequest();
        document.getElementById('checkout-now').click();
        waitTillCheckoutPageIsOpen();
    }

    async function addExtraItemByRequest() {
        let promises = [];
        for (let i = 0; i < items.length; i ++) {
            if (i !== domItemIndex) {
                let selectedItem = items[i];
                promises.push(getSingleItemInfo(selectedItem))
            }
        }

        await Promise.all(promises);
        await addItems();


    }

    async function addItems() {
        for (let k = 0; k < add_requests.length; k++) {
            let addRequest = add_requests[k];
            await addOrRemoveItem(addRequest, area);
        }
    }

    async function addOrRemoveItem(itemInfo, area) {
        let styleParam = (area === 'USA' || area === 'CANADA') ? 'st': 'style';
        let sizeParam = (area === 'USA' || area === 'CANADA') ? 's': 'size';
        let param = `utf8=%E2%9C%93&qty=1&${styleParam}=${itemInfo.style}&${sizeParam}=${itemInfo.size}&commit=add+to+cart`;
        let payLoad = {
            method: "POST",
            headers: {
                "x-requested-with": "XMLHttpRequest",
                "content-type":	"application/x-www-form-urlencoded"
            },
            body: param,
        };
        return retryFetch(`https://www.supremenewyork.com/shop/${itemInfo.itemId}/add.json`, payLoad, 0);
    }

    async function getSingleItemInfo(item) {
        let new_items = products[item['category']];
        for (let index = 0; index < new_items.length; index ++) {
            let each_item = new_items[index];
            if (matchKeyWord(each_item ['name'], item['keyWords'])) {
                return fetchItem(each_item['id'], item );
            }
        }

    }

    function fetchItem(itemId, item) {
        return retryFetch(`/shop/${itemId}.json`)
            .then(respond => {
                let atcObject = getAtcObject(respond['styles'], item);
                if (atcObject.s != null) {
                    add_requests.push({'size': atcObject.s, 'style': atcObject.st, 'itemId': itemId});
                }
            });
    }

    function getAtcObject(possibleItems, item) {
        let style = null;
        for (let i = 0; i < possibleItems.length; i ++) {
            let each = possibleItems[i];
            if (matchKeyWord(each['name'], item['preferColor'])) {
                let size = getSize(each, item['preferredSize']);
                if (size != null) {
                    return {'st': each['id'], 's': size};
                }
            }
        }
        return {'st': style, 's': null};
    }

    function getSize(each, wantedSize) {
        let sizes = each['sizes'];
        let pickedSize = null;
        for (let j = 0; j < sizes.length; j ++) {
            let size = sizes[j];
            let lowerWantedSize = wantedSize.toLowerCase();
            let currentSize = size['name'].toLowerCase();
            if (size['stock_level'] > 0) {
                if (pickedSize == null) {
                    pickedSize = size['id'];
                }
                if (lowerWantedSize === 'any' || currentSize === lowerWantedSize || size['name'] === 'N/A') {
                    pickedSize = size['id'];
                    break;
                }
            }
        }
        return pickedSize;
    }



    async function waitTillCheckoutPageIsOpen() {

        let checkoutBtn = document.getElementById("submit_button");
        if (checkoutBtn) {
            notifyHeader.innerHTML = "正在填写个人信息。。。";
            await sleep(form_fill_delay);
            document.getElementById("order_billing_name").focus();
            document.getElementById("order_billing_name").value = billing_name;

            await sleep(form_fill_delay);
            document.getElementById("order_email").focus();
            document.getElementById("order_email").value = order_email;
            await sleep(form_fill_delay);
            document.getElementById("order_tel").focus();
            document.getElementById("order_tel").value = order_tel;
            await sleep(form_fill_delay);
            document.getElementById("order_billing_address").focus();
            document.getElementById("order_billing_address").value = order_address;

            if (document.getElementById("order_billing_address_2")) {
                await sleep(form_fill_delay);
                document.getElementById("order_billing_address_2").focus();
                document.getElementById("order_billing_address_2").value = order_billing_address_2;
            }
        

            if (document.getElementById("obz")) {
                await sleep(form_fill_delay);
                document.getElementById("obz").focus();
                document.getElementById("obz").value = order_billing_zip;
            }
            if (document.getElementById("order_billing_zip")) {
                await sleep(form_fill_delay);
                document.getElementById("order_billing_zip").focus();
                document.getElementById("order_billing_zip").value = order_billing_zip;
            }
            await sleep(form_fill_delay);

            document.getElementById("order_billing_city").focus();
            document.getElementById("order_billing_city").value = order_billing_city;

            if (document.getElementById("order_billing_country")) {
                await sleep(form_fill_delay);
                document.getElementById("order_billing_country").value = order_billing_country;
                document.getElementById("order_billing_country").dispatchEvent(event);
            }

            if (document.getElementById("order_billing_state")) {
                await sleep(form_fill_delay);
                document.getElementById("order_billing_state").focus();
                document.getElementById("order_billing_state").value = order_billing_state;
                document.getElementById("order_billing_state").dispatchEvent(event);
            }
        
            if (document.getElementById("credit_card_type")) {
                await sleep(form_fill_delay);
                document.getElementById("credit_card_type").value = credit_card_type;
                document.getElementById("credit_card_type").dispatchEvent(event);
            }
            if (document.getElementById("credit_card_n")) {
                await sleep(form_fill_delay);
                document.getElementById("credit_card_n").focus();
                document.getElementById("credit_card_n").value = cnb;
            }
            if (document.getElementById("credit_card_month")) {
                await sleep(form_fill_delay);
                document.getElementById("credit_card_month").focus();
                document.getElementById("credit_card_month").value = month;
                document.getElementById("credit_card_month").dispatchEvent(event);
            }
            if (document.getElementById("credit_card_year")) {
                await sleep(form_fill_delay);
                document.getElementById("credit_card_year").focus();
                document.getElementById("credit_card_year").value = year;
                document.getElementById("credit_card_year").dispatchEvent(event);
            }
            if (document.getElementById("cav")) {
                await sleep(form_fill_delay);
                document.getElementById("cav").focus();
                document.getElementById("cav").value = vval;
            }
            if (document.getElementById("credit_card_cvv")) {
                await sleep(form_fill_delay);
                document.getElementById("credit_card_cvv").focus();
                document.getElementById("credit_card_cvv").value = vval;
            }

            await sleep(form_fill_delay);
            document.getElementById("order_terms").click();

            notifyHeader.innerHTML = "填写完毕，请结账。。。";
            if (autoCheckout){
                notifyHeader.innerHTML = "自动结账中。。。";
                await sleep(checkout_delay);
                document.getElementById("hidden_cursor_capture").click();
            }
            console.log('paymentTime: ' + (new Date().getTime() - startTime) + ' ms');
            notifyHeader.remove();
        } else {
            setTimeout(async function(){ await waitTillCheckoutPageIsOpen(); }, 100);
            console.log("waiting to Chekcout...");
        }
    }

    monitor()
})();

completion();