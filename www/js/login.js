var urlBackend = "http://10.10.10.24:8080";

var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {

        $("#anmelden").on("click", function() {
            var userName = $("#userName").val();
        	var url = urlBackend + "/rest/bedienungen/login?userName=" + userName + "&password=" + $("#password").val();
        	var request = new XMLHttpRequest();
        	request.open("GET", url, true);

			request.onreadystatechange = function reveicedData() {
				if (request.readyState == 4) { // Daten empfangen
					var success = request.responseText;
					if(success) {
                        localStorage.userName = userName;
						window.location = "main.html";
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