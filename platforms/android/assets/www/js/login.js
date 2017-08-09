var urlBackend = "http://10.10.10.24:8080";

var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        $("#anmelden").on("click", function() {
			//$("#wrongCredentials").show(500);

        	var url = urlBackend + "/rest/bedienungen/login?userName=" + $("#userName").val() + "&password=" + $("#password").val();

        	var request = new XMLHttpRequest();
        	request.open("GET", url, true);

			request.onreadystatechange = function reveicedData() {
				if (request.readyState == 4) { // Daten empfangen
					var success = request.responseText;
					if(success == true) {
						window.location = "/main";
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

//Only for firefox
/*window.onload = function() {
    app.onDeviceReady();
}*/