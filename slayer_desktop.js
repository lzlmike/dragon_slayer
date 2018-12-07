// ?? ??? “?? - Hypeeyes”??,????????
// ??: https://www.youtube.com/watch?v=gbe9vG4kwaY&feature=youtu.be
// Photo Name of item
var target = '???';
//??? ??????
var keyWord = 'box,logo'; 
//????????
var category = 'sweatshirts';
// ??
var preferColor = 'black';
// Your size
var preferredSize = 'medium'; // "Small", "Medium", "Large", "XLarge", "9", "9.5" ....  US 9 = UK 10
// autoFill
var autoFill = false;
//????,????? true
var autoPay = false;
//??????,????1000; (1s)
var delay = 1000;

//Address info
var billing_name = "Name li";
var order_email = "xxx@xxx.com";
var order_tel = "1234567811";
var order_address = "my_adr_1";
var order_address_2 = "my_adr_2";
var order_address_3 = "my_adr_3";
var order_billing_zip = "95116";
var order_billing_city = "my_city";
var order_billing_state = "CA";

var order_billing_country = "AT";
// ?????????
//<option value="GB">UK</option>
// <option value="NB">UK (N. IRELAND)</option>
// <option value="AT">AUSTRIA</option>
// <option value="BY">BELARUS</option>
// <option value="BE">BELGIUM</option>
// <option value="BG">BULGARIA</option>
// <option value="HR">CROATIA</option>
// <option value="CZ">CZECH REPUBLIC</option>
// <option value="DK">DENMARK</option>
// <option value="EE">ESTONIA</option>
// <option value="FI">FINLAND</option>
// <option value="FR">FRANCE</option>
// <option value="DE">GERMANY</option>
// <option value="GR">GREECE</option>
// <option value="HU">HUNGARY</option>
// <option value="IS">ICELAND</option>
// <option value="IE">IRELAND</option>
// <option value="IT">ITALY</option>
// <option value="LV">LATVIA</option>
// <option value="LT">LITHUANIA</option>
// <option value="LU">LUXEMBOURG</option>
// <option value="MC">MONACO</option>
// <option value="NL">NETHERLANDS</option>
// <option value="NO">NORWAY</option>
// <option value="PL">POLAND</option>
// <option value="PT">PORTUGAL</option>
// <option value="RO">ROMANIA</option>
// <option value="RU">RUSSIA</option>
// <option value="SK">SLOVAKIA</option>
// <option value="SI">SLOVENIA</option>
// <option value="ES">SPAIN</option>
// <option value="SE">SWEDEN</option>
// <option value="CH">SWITZERLAND</option>
// <option value="TR">TURKEY</option>

//Payment info
//================== EU =============================
var card_type = "visa"; // "visa", "american_express", "master", "solo", "paypal"
// ==================================================
var cnb = "10000000000000001";
var month = "01";
var year = "2022";
var vval = "123";


/////////////////////////////////////////////////////////////////////////////////////////
var wins = {};
var checkout_URL = "https://www.supremenewyork.com/checkout";
var startTime = null;
var done = false;
var found = false;

function matchName(itemName, keyWords) {
    let name = itemName.toLowerCase().trim();
    let keyWordsList = keyWords.toLowerCase().split(",");

    for (let i = 0; i < keyWordsList.length; i ++) {
        if (!name.includes(keyWordsList[i].trim())) {
            return false;
        }
    }
    return true;
}

var sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/*
automatically choose correct size, if applicable
*/
(function waitTillArticlePageIsOpen() {
    // check if article page has loaded by looking at main image
    if ($("#img-main")[0]) {
        // choose appropriate size, if applicable
        found = true;
        if ($('form').attr('id') === "cart-remove") {
            sleep(500).then(() => checkout());
            return;
        }

        if ($("select")[0]) {
            for (var i = 0; i < $("select")[0].options.length; i++) {
                let size = $("select")[0].options[i].text.toLowerCase().trim();
                let preferSize = preferredSize.toLowerCase().trim();
                let us_size = size.split('/')[0];
                if (size === preferSize || us_size.includes('US') && us_size.includes(preferSize)) {
                    $("select")[0].selectedIndex = i;
                    break;
                }
            }
        }
        console.log("done choosing size.")
        sleep(300).then(() => addToCart());
    } else {
        setTimeout(function(){ waitTillArticlePageIsOpen(); }, 300);
        console.log("waiting to item page load...");
    }

    return;
})();

(function monitoring() {
    if (found) {
        return;
    }

    var items = $('#container').find('.inner-article').filter((i, e)=> e.querySelector('a div') === null);
    for (let i = 0; i < items.length; i ++) {
        let image = items[i].getElementsByTagName('img')[0];

        let nameAndColor = items[i].innerText.trim().split('\n');
        let name = nameAndColor[0];
        let color = nameAndColor[1];

        if (image.alt.toLowerCase().match(target.toLowerCase()) || matchName(name, keyWord) && color.toLowerCase().includes(preferColor.toLowerCase())) {
            found = true;
            startTime = new Date().getTime();
            image.focus();
            sleep(300).then(
                () => image.click()
            );
            break;
        }
    }

    if (!found) {
	let lists  = $('#nav-categories')[0].children;
	for (list of lists) {
	
		if (list.innerText === category) {
			list.children[0].click();
			break;
		}
	}
        setTimeout(monitoring, 1500)
        console.log("monitoring....");
    }
})()

function addToCart() {
    /*
    Script to use on item screen
    */
    // add to cart
    if (document.getElementsByName('commit')[0]) {
        document.getElementsByName('commit')[0].click();
    }
    // Wait until cart updates, then go to checkout
    var itemsCountElm = $("#items-count");

    (function waitTillCartUpdates() {
        if (itemsCountElm.text() == '') {
            setTimeout(function(){ waitTillCartUpdates(); }, 10);
            return;
        } else {
            // Click checkout button
            sleep(300).then(() => checkout());
            return;
        }
    })();
}

function checkout () {
    if (autoFill) {
        wins['checkout'] = window.open(checkout_URL, '_blank');
        payment();
    } else {
        document.getElementsByClassName('checkout')[0].click();
    }
}

function payment() {
    //console.log(urls)
    let win = wins['checkout']
    if (win.document.getElementById('checkout_form')) {
        /*
        Script to use on checkout screen
        */ 
        win.$('input#order_billing_name').attr('value', billing_name);

        win.$('input#order_email').attr('value', order_email);
        win.$('input#order_tel').attr('value', order_tel);
        win.$('input#order_billing_address').attr('value', order_address);
        win.$('input#bo').attr('value', order_address);
        win.$('input#oba3').attr('value', order_address_2);
        win.$('input#order_billing_zip').attr('value', order_billing_zip);
        win.$('input#order_billing_city').attr('value', order_billing_city);
        win.$('select#order_billing_country').val(order_billing_country.toUpperCase());
        win.$('select#order_billing_country').trigger('change');
        win.$('select#order_billing_state').val(order_billing_state);
        if (win.$('select#order_billing_state').val() === '') {
            win.$('select#order_billing_state').val(' ' + order_billing_state); // HACK!!! their option has a space
        }
        win.$('#order_billing_address_3').val(order_billing_state); // Europe

        win.$('input#nnaerb').attr('value', cnb);
        win.$('input#cnb').attr('value', cnb);
        win.$('input#nnaerb').keyup();
        win.$('input#cnb').keyup();

        win.$('select#credit_card_month').val(month);
        win.$('select#credit_card_year').val(year);
        win.$('input#orcer').attr('value', vval);
        win.$('input#vval').attr('value', vval);
        win.$('.checkbox').attr('checked', 'checked');
        win.$('form#checkout_form').attr('data-verified', 'done');
        win.$('#credit_card_type').find('option:contains("' + card_type + '")').prop("selected", true);

        pay();
    } else {
        setTimeout(function(){ payment(); }, 10);
        return;
    }
}

async function pay() {
    let win = wins['checkout']
    if (autoPay) {
        await sleep(delay);
        win.document.getElementsByName('commit')[0].click();
    }
}