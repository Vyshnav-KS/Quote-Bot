const Discord = require("discord.js");
const fetch = require("node-fetch");
const dontStop = require("./server");
const Database = require("@replit/database");

const mySecret = process.env["SECRET_TOKEN"];

const db = new Database();

const client = new Discord.Client();

const sad_words = [
	"sad",
	"depressed",
	"unhappy",
	"angry",
	"tensed",
	"lonely",
	"heartbroken",
	"gloomy",
	"disappointed",
	"hopeless",
	"grieved",
	"unhappy",
	"lost",
	"worried",
	"doubtful",
	"nervous",
	"anxious",
	"terrified",
	"panicked",
	"horrified",
	"desperate",
	"confused",
	"stressed",
];

const encouragementsList = [
	"Cheer up!",
	"Hang in there.",
	"You are a great person!",
	"Everything gonna be alright.",
];

db.get("encouragements").then((encouragements) => {
	if (!encouragements || encouragements.length < 1) {
		db.set("encouragements", encouragementsList);
	}
});

db.get("responding").then((value) => {
	if (value == null) {
		db.set("responding", true);
	}
});

function updateEncouragements(encouragingMesssage) {
	db.get("encouragements").then((encouragements) => {
		encouragements.push([encouragingMesssage]);
		db.set("encouragements", encouragements);
	});
}

function deleteEncouragements(index) {
	db.get("encouragements").then((encouragements) => {
		if (encouragements.length > index) {
			encouragements.splice(index, 1);
			db.set("encouragements", encouragements);
		}
	});
}

function getQuote() {
	return fetch("https://zenquotes.io/api/random")
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			return data[0]["q"] + " -" + data[0]["a"];
		});
}

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
	if (msg.author.bot) return {};

	if (msg.content === "$quote") {
		getQuote().then((quote) => msg.channel.send(quote));
	}

	db.get("responding").then((responding) => {
		if (responding && sad_words.some((word) => msg.content.includes(word))) {
			db.get("encouragements").then((encouragements) => {
				const encouragement =
					encouragements[Math.floor(Math.random() * encouragements.length)];
				msg.reply(encouragement);
			});
		}
	});

	if (msg.content.startsWith("$new")) {
		encouragingMesssage = msg.content.split("$new ")[1];
		updateEncouragements(encouragingMesssage);
		msg.channel.send("New encouraging message added.");
	}

	if (msg.content.startsWith("$del")) {
		index = parseInt(msg.content.split("$del ")[1]);
		deleteEncouragements(index);
		msg.channel.send("Encouraging message deleted.");
	}

	if (msg.content.startsWith("$list")) {
		db.get("encouragements").then((encouragements) => {
			msg.channel.send(encouragements);
		});
	}

	if (msg.content.startsWith("$responding")) {
		value = msg.content.split("$responding ")[1];

		if (value.toLowerCase() == "true") {
			db.set("responding", true);
			msg.channel.send("Responding is on.");
		} else {
			db.set("responding", false);
			msg.channel.send("Responding is off.");
		}
	}
});

dontStop();
client.login(mySecret);
