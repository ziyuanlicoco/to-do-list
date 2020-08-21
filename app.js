const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + "/date.js");

const app = express();

const workItems = [];

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-coco:todolistTest123@cluster0.upqgf.mongodb.net/todolistDB?retryWrites=true&w=majority", { useNewUrlParser: true });

const itemSchema = {
	name: String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
	name: "Welcome to your todolist"
});

const item2 = new Item({
	name: "What to do next"
});

const item3 = new Item({
	name: "Try me"
});

const defaultItems = [item1, item2, item3];


const listSchema = {
	name: String,
	items: [itemSchema]
};
const List = mongoose.model("List", listSchema);


app.get('/',(req,res) => {
	
	Item.find({}, (err, foundItems) =>{

		if (foundItems.length === 0){
			Item.insertMany(defaultItems, (err) =>{
				if (err){
					console.log(err);
				}
				else{
					console.log("Success!");
				}
			});
			res.redirect('/');
		}
		else{
			res.render("list", {listTitle: "Today", newListItem: foundItems});
		}
		
	});
	
});

app.get("/:customListName", (req,res) =>{
	const customListName = _.capitalize(req.params.customListName);
	
	List.findOne({name: customListName}, (err, foundList) =>{
		if(!err){
			if(!foundList){
				const list = new List({
					name: customListName,
					items: defaultItems
				});

				list.save();
				res.redirect("/" + customListName);
			}
			else{
				res.render("list", {listTitle: foundList.name, newListItem: foundList.items});
			}
		}
	})
	

});

app.post('/', (req,res) =>{
	const itemName = req.body.newItem;
	const listName = req.body.list;

	const item = new Item({
		name: itemName
	});

	if(listName === "Today"){
		item.save();
		res.redirect('/');
	}
	else{
		List.findOne({name: listName},(err, foundList) =>{
			foundList.items.push(item);
			foundList.save();
			res.redirect("/" + listName);
		});
	}

	

	// if (req.body.list === "Work"){
	// 	workItems.push(item);
	// 	res.redirect("/work");
	// }else{
	// 	items.push(item);
	// 	res.redirect("/");
	// }
	
});

app.post('/delete', (req,res) =>{

	const checkedItemId = req.body.checkbox;
	const listName = req.body.listName;

	if(listName === "Today"){
		Item.findByIdAndRemove(checkedItemId,(err) =>{
			if (!err){
				res.redirect("/");
			}else{
				console.log(err);
			}
		});
	}
	else{
		List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, (err, foundList) =>{
			if(!err){
				res.redirect("/" + listName);
			}
			else{
				console.log(err);
			}
		});
	}

	
});



// app.get('/work',(req,res) => {
// 	res.render("list", {listTitle: "Work List", newListItem: workItems});
// });


app.listen(process.env.PORT || 3100, () =>{
	console.log('Listening');
});