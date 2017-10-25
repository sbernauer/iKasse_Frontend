var urlBackend = "http://172.16.55.96:8080";

var userName;
var totalPrice;
var timerLongPress;
var temp;

var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {

        // Here starts th ecode for the Login-Screen
        $("#anmelden").on("click", function() {

            //TODO
            //userName = "root";
            //$("#login").hide();
            //$("#main").show();
            //getSpeisenFromBackend();
            //return;
            //TODO

            var tmpUserName = $("#userName").val();
            var url = urlBackend + "/rest/bedienungen/login?userName=" + tmpUserName + "&password=" + $("#password").val();
            var request = new XMLHttpRequest();
            request.open("GET", url, true);

            request.onreadystatechange = function reveicedData() {
                if (request.readyState == 4) { // Daten empfangen
                    if(request.responseText == "true") {
                        userName = tmpUserName;
                        $("#login").hide();
                        $("#main").show();
                        getSpeisenFromBackend();
                    } else {
                        $("#wrongCredentials").show();
                    }
                }
            };

            request.send();
        });
    }
};

app.initialize();

// Here starts the code for the Main-Screen

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
    $("#bestellen").on("click", function() {

        calculateTotalPrice();
        if(totalPrice == 0) {
            window.plugins.toast.show('Leere Bestellung wurde nicht geschickt', 'short', 'center');
            return;
        }

        $("#bestellen").val("wird geschickt...");
        $("#bestellen").prop("disabled", true);

        var bestellung = {};
        bestellung.userName = userName;
        bestellung.time = new Date().toLocaleString();
        bestellung.table = "TODO";

        var orders = [];

        $(".kachel").filter(function(index, element) {
            return ($(element).find(".amount").text()) != "0";
        }).each(function(index, element) {
            var dataset = {};
            dataset.id = $(element).data("id");
            dataset.amount = $(element).find(".amount").text() * 1;
            orders.push(dataset);
        });

        bestellung.orders = orders;

        $.ajax({
          type: "POST",
          url: urlBackend + "/rest/bestellungen/add",
          data: JSON.stringify(bestellung),
          success: function(response) {
            if(response) {
                navigator.vibrate(400);
                resetContent();
                window.plugins.toast.showWithOptions({
                    message: "Bestellung geschickt",
                    duration: "short",
                    position: "center",
                    styling: {
                      backgroundColor: '#00ff00', // make sure you use #RRGGBB. Default #333333
                      textColor: '#000000', // Ditto. Default #FFFFFF
                      textSize: 32, // Default is approx. 13.
                      cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
                      horizontalPadding: 20, // iOS default 16, Android default 50
                      verticalPadding: 16 // iOS default 12, Android default 30
                    }
                });

                $("#bestellen").prop("disabled", false);
                $("#bestellen").val("Bestellen");

            } else {
                navigator.vibrate(2000);
                alert("Fehler bei Bestellung. Bitte starte die App neu und probiere es erneut.");
                $("#bestellen").prop("disabled", false);
                $("#bestellen").val("Erneut probieren");
            }
          },
          error: function(iqXHR, textStaus, errorThrown) {
            navigator.vibrate(2000);
            alert("Bestellung konnte nicht gesendet werden!\n" + textStaus + "\n" + errorThrown);
            $("#bestellen").prop("disabled", false);
            $("#bestellen").val("Erneut probieren");
          },
          contentType: "application/json"
        });

        console.log(JSON.stringify(bestellung));
    });

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
}

function calculateTotalPrice() {
    totalPrice = 0;

    $(".kachel").filter(function(index, element) {
        return ($(element).find(".amount").text()) != "0";
    }).each(function(index, element) {
        var priceWithEuro = $(element).find(".price").text();
        var price = priceWithEuro.substring(0, priceWithEuro.length - 2);
        totalPrice += $(element).find(".amount").text() * price;
    });
}

function displayTotalPrice() {
    calculateTotalPrice();
    $("#footer_left").text(totalPrice + " €");
}

function resetContent() {
    $(".kachel .amount").text("0").css("opacity", 0.55);
    displayTotalPrice();
}

//Only for firefox
window.onload = function() {
    if (navigator.userAgent.search("Firefox") > -1) {
        app.onDeviceReady();
        window.plugins = {};
        window.plugins.toast = {};
        window.plugins.toast.show = function(str) {
            alert(str);
        }
        window.plugins.toast.showWithOptions = function(options) {
            alert(options.message);
        }
    }
}