var express = require('express');
var app = express();
var ejs = require('ejs')
var ejsLayouts = require('express-ejs-layouts');
var db = require('./models');
var methodOverride = require('method-override')


const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({accessToken: 'pk.eyJ1IjoicXVpd2FhbiIsImEiOiJjanFta3hhZmUwbDF6M3hwNXp4MTRidjJxIn0.UQqQQG2a66_VY5pfcJPZ1g'});
app.use(methodOverride('_method'))
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(express.urlencoded({extended: false}));

app.get('/', function(req, res){
	db.traveler.findAll()
	.then(function(travelers){
		res.render('home', {travelers: travelers })
	})
	.catch(function(err){
		console.log(err)
	})
	
})

app.get('/results', function(req, res){
	geocodingClient
	.forwardGeocode({
		query: req.query.city+", "+req.query.state,
		types: ['place'],
		countries: ['us']
	})
	.send()
	.then(function(response){
		var results = response.body.features.map(function(city){
			var placeNameArr = city.place_name.split(', ');
			console.log(placeNameArr)
			return{
				city: placeNameArr[0] ,
				state: placeNameArr[1] ,
				lat: city.center[1] ,
				long: city.center[0]
			}
		})
		console.log(req.query)
		res.render('search-results', {searchTerms: req.query, results: results})
		
	})
	
})

app.get('/favorites', function(req, res){
	db.place.findAll().then(function(places){
		var markers = places.map(function(place){
			var markerObj = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [place.long, place.lat]
                    },
                    "properties": {
                        "title": place.city,
                        "icon": "airport"
                    }
                }
             return JSON.stringify(markerObj);
			})
		 res.render('favorites', {places: places, markers: markers})		
		})
	})
	// use sequalize to pull favs from database and list in ejs
	

app.post('/add', function(req, res){
	console.log(req.body)
	// todo use sequelize to add city to the database (findOrCreate)
	db.place.findOrCreate({
		where: {
			city: req.body.city,
			state: req.body.state
		},
		defaults: {
			lat: req.body.lat,
			long: req.body.long
		}
	})
	.spread(function(place, created){
		db.traveler.findById(req.body.travelerId)
		.then(function(traveler){
			place.addTraveler(traveler)
			.then(function(traveler){
				console.log("association happen")
			}).catch(function(err){
				console.log()
			})
		})
	})
	.then(function(back){
			console.log('posting to the database', req.body);
	res.redirect('/favorites');
	})
})

app.delete('/:favorites/:id', function(req, res) {
  db.place.destroy({
    where: {id: req.params.id }
		
  }).then(function(deletedPlace){
  	db.placeTraveler.destroy({
  		where: { placeId: req.params.id}
  	}).then(function(deleteAssociations){
  		res.redirect('/favorites')
  	}).catch(function(err){
  		console.log("error, err")
  		res.send(error)
  	})
  });
});

app.get('/travelers', function(req, res){
	db.traveler.findAll().then(function(travelers){
		res.render('travelers', { travelers: travelers })
	})
})

app.post('/travelers', function(req, res){
	db.traveler.create(req.body)
	.then(function(){
		res.redirect('/travelers')

	})
	
})

app.get('/traveler/:id', function(req, res){
	db.traveler.findById(req.params.id)
	.then(function(traveler){
		traveler.getPlaces().then(function(places){
			var markers = places.map(function(place){
			var markerObj = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [place.long, place.lat]
                    },
                    "properties": {
                        "title": place.city,
                        "icon": "airport"
                    }
                }
             return JSON.stringify(markerObj);
			})
			res.render('traveler-show', { traveler: traveler, places: places, markers: markers })
		})
		
	})	
})

app.delete('/association', function(req, res) {
 db.placeTraveler.destroy({
  		where: {
  			placeId: req.body.placeId,
  			travelerId: req.body.travelerId
  		}

  }).then(function(deletedAssociations){
  	res.redirect('/traveler/'+req.body.travelerId);

  })
  	
})




app.listen(8000)