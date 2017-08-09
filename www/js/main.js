var urlBackend = "http://10.10.10.24:8080";

var totalPrice;
var timerLongPress;
var temp;

var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        getSpeisenFromBackend();
    }
};

app.initialize();

function getSpeisenFromBackend() {
    var request = new XMLHttpRequest();
    request.open("GET", urlBackend + "/rest/speisen/all", true);

    request.onreadystatechange = function reveicedData() {
        if (request.readyState == 4) { // Daten empfangen
            var speisen = JSON.parse(request.responseText);
            renderSpeisen(speisen);
        }
    }

    request.send();
}

function renderSpeisen(speisen) {

    $("content").empty();
    for(var i = 0; i < speisen.length; i++) {
        var newKachel = $('<div class="kachel"><p class="description">'
         + speisen[i].description + '</p><div class="priceAndAmount"><p class="price">'
         + speisen[i].price + ' €</p><p class="amount">0</p></div></div>');

        newKachel.data("id", speisen[i].id);
        $("#content").append(newKachel);
    }

    registerListeners();
}

function registerListeners() {
    $(".kachel").on("click", function() {
        var $this = $(this);
        var amountBefore = $this.find(".amount").text() * 1;
        if(amountBefore == 0) {
            $this.css("opacity", 1);
        }
        $this.find(".amount").text(amountBefore + 1);

        displayTotalPrice();

    });

    $('.kachel').on("mousedown", function() {
        temp = this;
        timerLongPress = setTimeout(function(){
            var $this = $(temp);
            var amountBefore = $this.find(".amount").text() * 1;
            if(amountBefore == 1) {
                $this.css("opacity", 0.55);
            }
            if(amountBefore <= 0) {
                amountBefore = 1;
            }
            $this.find(".amount").text(amountBefore - 1);

            displayTotalPrice();

        }, 500);
    }).on("mouseup mouseleave", function() {
        clearTimeout(timerLongPress);
    });

    $("#bestellen").on("click", function() {
        var bestellung = {};
        bestellung.bedienung = "TODO";
        bestellung.time = "TODO";
        bestellung.table = "TODO";

        var data = [];

        $(".kachel").filter(function(index, element) {
            return ($(element).find(".amount").text()) != "0";
        }).each(function(index, element) {
            var dataset = {};
            dataset.id = $(element).data("id");
            dataset.amount = $(element).find(".amount").text() * 1;
            data.push(dataset);
        });

        bestellung.data = data;
        console.log(JSON.stringify(bestellung));
    });
}

function calculateTotalPrice() {
    totalPrice = 0;

    $(".kachel").filter(function(index, element) {
        return ($(element).find(".amount").text()) != "0";
    }).each(function(index, element) {
        var priceWithEuro = $(element).find(".price").text();
        var price = priceWithEuro.substring(0, priceWithEuro.length - 2);
        //console.log($(element).find(".amount").text() + ",  " + price);
        totalPrice += $(element).find(".amount").text() * price;
    });
}

function displayTotalPrice() {
    calculateTotalPrice();
    $("#footer_left").text(totalPrice + " €");
}

//Only for firefox
window.onload = function() {
    app.onDeviceReady();
}