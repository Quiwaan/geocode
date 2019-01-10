var db = require('./models');

//get a referance to a place

db.place.findOrCreate({
	where: {
		city: "Portland"
	}
}).spread(function(place, create){
	//get a refernce to a traveler
	db.traveler.findOrCreate({
		where: { firstname: "Quiwaan"}
	}).spread(function(traveler, created){
		//use the addModel method to attach one piece of data to another
		place.addTraveler(traveler).then(function(traveler){
			console.log(traveler, "added to", place);
		})
	})
})