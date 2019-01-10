const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({accessToken: 'pk.eyJ1IjoicXVpd2FhbiIsImEiOiJjanFta3hhZmUwbDF6M3hwNXp4MTRidjJxIn0.UQqQQG2a66_VY5pfcJPZ1g'});

// forward geocdoing
geocodingClient
.forwardGeocode({
	query: 'Seattle, WA'
})
.send()
.then(response => {
	console.log(response.body.features[0].geometry);
})


geocodingClient
.reverseGeocode({
	query: [ -122.3301, 47.6038 ],
	types: ['place']
})
.send()
.then(response => {
	console.log(response.body.features)
})