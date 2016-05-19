(function(){  console.log("on admin login called.")
	var sendEditorMsg;
	var postedData = {};

	var msgTagMap = {
		init: Function.prototype, 		// gets sent on successful login by toolbar's init contentload event listener
		loginRole: sendRole,
		uploadData: recieveEntityData
	};
  window.addEventListener('message', webviewMsgHandler, false);
  document.addEventListener("DOMContentLoaded", onDomLoad);

	function onDomLoad() {
		sendResultStubs();
	}
	function sendMsg(appId, appOrigin, msgData) {
		appId.postMessage(msgData, appOrigin)
	}
  function webviewMsgHandler(msg) { console.log("Msg recieved = %O", msg);
  	sendEditorMsg = sendMsg.bind(null, msg.source, msg.origin);
  	msgTagMap[msg.data.tag](msg.data);
  }
	function sendRole(msgData) {
		var userRole = $('body').data("user-role");
		var userName = $('body').data("user-name");
		sendEditorMsg({
			tag: "loginRole",
			role: userRole,
			user: userName
		});
	}
	function ajaxError(jqXHR, textStatus, errorThrown) {
		console.log("ajaxError = %s - jqXHR:%O", errorThrown, jqXHR);
	}


/*------------------Post Entity Data Methods-------------------------*/
	function dataSubmitSucess(data, textStatus, jqXHR) { console.log("Something Like Success! data = %O, textStatus = %s, jqXHR = %O", data, textStatus, jqXHR);
		var entity = Object.keys(data)[0];
		postedData[entity] = data[entity];  console.log("postedData = %O", postedData)
	}
	function recieveEntityData(msgData) {  console.log("data to upload = %O", msgData.data);
		var entities = ['author', 'publication']
		var data = msgData.data;

		entities.forEach(function(entity){
			var dataObj = { entityData: data[entity], refData: postedData };
			postEntityData(entity, dataObj);
		});
	}
	function postEntityData(entity, data) {
    $.ajax({
		  method: "POST",
		  url: $('body').data('ajax-target-url') + entity + '/post',
		  success: dataSubmitSucess,
		  error: ajaxError,
		  data: JSON.stringify(data)
		});
	}




	/*------------- Stubby Methods -------------------------------------------------------------------------*/
	function sendResultStubs() {
		recieveEntityData(getResultStubs());
	}
	function getResultStubs() {
		return { "data": {
				"author": {
			    "2": {
			      "shortName": "Acosta y Lara",
			      "last": "Acosta y Lara",
			      "first": "Eduardo",
			      "middle": "F",
			      "suffix": null,
			      "tempId": 2
			    },
			    "3": {
			      "shortName": "Albuja",
			      "last": "Albuja",
			      "first": "L",
			      "middle": null,
			      "suffix": null,
			      "tempId": 3
			    },
			    "4": {
			      "shortName": "Alcorn",
			      "last": "Alcorn",
			      "first": "Stanley",
			      "middle": "M",
			      "suffix": null,
			      "tempId": 4
			    },
			    "5": {
			      "shortName": "Alonso-Mejía",
			      "last": "Alonso-Mejía",
			      "first": "Alfonso",
			      "middle": null,
			      "suffix": null,
			      "tempId": 5
			    },
			    "12": {
			      "shortName": "Areces-Mallea",
			      "last": "Areces-Mallea",
			      "first": "Alberto",
			      "middle": "E",
			      "suffix": null,
			      "tempId": 12
			    },
			    "233": {
			      "shortName": "McGregor",
			      "last": "McGregor",
			      "first": "S",
			      "middle": "E",
			      "suffix": null,
			      "tempId": 233
			    },
			    "262": {
			      "shortName": "Olin",
			      "last": "Olin",
			      "first": "G",
			      "middle": null,
			      "suffix": null,
			      "tempId": 262
			    }
			  },
			  "publication": {
			    "1": {
			      "pubTitle": "Comunicaciones Zoologicas del Museo de Historia Natural de Montevideo",
			      "pubType": null,
			      "publisher": null,
			      "tempId": 1
			    },
			    "2": {
			      "pubTitle": "Science",
			      "pubType": null,
			      "publisher": null,
			      "tempId": 2
			    },
			    "3": {
			      "pubTitle": "Cactus and Succulent Journal of the Cactus and Succulent Society of Am",
			      "pubType": null,
			      "publisher": null,
			      "tempId": 3
			    },
			    "4": {
			      "pubTitle": "Atas Soc. Bot. Brasil",
			      "pubType": null,
			      "publisher": null,
			      "tempId": 4
			    },
			    "5": {
			      "pubTitle": "Ph.D. Dissertation",
			      "pubType": null,
			      "publisher": null,
			      "tempId": 5
			    }
			  },
			  "citation": {
			    "1": {
			      "citId": 1,
			      "citShortDesc": "Acosta y Lara, E. 1950",
			      "fullText": "Acosta y Lara, E. 1950. Quirópteros de Uruguay. Comunicaciones Zoologicas del Museo de Historia Natural de Montevideo III: 1-74.",
			      "author": [
			        2
			      ],
			      "title": "Quirópteros de Uruguay",
			      "year": 1950,
			      "vol": null,
			      "issue": null,
			      "pgs": "1-74",
			      "publication": 1
			    },
			    "2": {
			      "citId": 2,
			      "citShortDesc": "Alcorn, S. M., S. E. McGregor & G. Olin. 1961",
			      "fullText": "Alcorn, S. M., S. E. McGregor & G. Olin. 1961. Pollination of saguaro cactus by doves, nectar-feeding bats and honey bees. Science 133: 1594-1595.",
			      "author": [
			        4,
			        233,
			        262
			      ],
			      "title": "Pollination of saguaro cactus by doves, nectar-feeding bats and honey bees",
			      "year": 1961,
			      "vol": null,
			      "issue": 133,
			      "pgs": "1594-1595",
			      "publication": 2
			    },
			    "3": {
			      "citId": 3,
			      "citShortDesc": "Alcorn, S. M., S. E. McGregor & G. Olin. 1962",
			      "fullText": "Alcorn, S. M., S. E. McGregor & G. Olin. 1962. Pollination requirements of the organ pipe cactus. Cactus and Succulent Journal of the Cactus and Succulent Society of America 34: 134-138.",
			      "author": [
			        4,
			        233,
			        262
			      ],
			      "title": "Pollination requirements of the organ pipe cactus",
			      "year": 1962,
			      "vol": null,
			      "issue": 34,
			      "pgs": "134-138",
			      "publication": 3
			    },
			    "9": {
			      "citId": 9,
			      "citShortDesc": "Areces-Mallea, A. E. 2002",
			      "fullText": "Areces-Mallea, A. E. 2002. Leptocereus (A. Berger) Britton and Rose: a monographic study of a West Indian genus of Cactaceae (Cactoideae). Ph.D. Dissertation. City University of New York, New York.",
			      "author": [
			        12
			      ],
			      "title": "Leptocereus (A. Berger) Britton and Rose: a monographic study of a West Indian genus of Cactaceae (Cactoideae)",
			      "year": 2002,
			      "vol": null,
			      "issue": null,
			      "pgs": null,
			      "publication": 5
			    },
			  },
			  "country": {
			    "1": "Uruguay",
			    "2": "Brazil",
			    "3": "USA",
			    "4": "Cuba",
			    "5": "Mexico",
			    "6": "Peru",
			    "7": "Venezuela",
			    "8": "Ghana",
			    "9": "Honduras",
			    "10": "Costa Rica",
			    "11": "Panama"
			  },
			  "region": {
			    "1": "South America",
			    "2": "North America",
			    "3": "West Africa",
			    "4": "Central America"
			  },
			  "habitatType": {
			    "1": "Forest",
			    "2": "Savanna",
			    "3": "Desert",
			    "4": "Shrubland"
			  },
			  "location": {
			    "1": {
			      "locDesc": "Uruguay-Forest",
			      "elev": null,
			      "elevRangeMax": null,
			      "lat": null,
			      "long": null,
			      "region": 1,
			      "country": 1,
			      "tempId": 1,
			      "habitatType": 1
			    },
			    "2": {
			      "locDesc": "Embrapa Cerrados",
			      "elev": 879,
			      "elevRangeMax": null,
			      "lat": "-15.6283333",
			      "long": "-47.37083333",
			      "region": 1,
			      "country": 2,
			      "tempId": 2,
			      "habitatType": 2
			    },
			    "3": {
			      "locDesc": "Tucson, AZ",
			      "elev": 758,
			      "elevRangeMax": null,
			      "lat": 32.2217429,
			      "long": "-110.926479",
			      "region": 2,
			      "country": 3,
			      "tempId": 3,
			      "habitatType": 3
			    }
			  },
			  "taxon": {
			    "1": {
			      "parent": null,
			      "name": "Animalia",
			      "level": 1,
			      "tempId": 1
			    },
			    "2": {
			      "parent": 1,
			      "name": "Chiroptera",
			      "level": 4,
			      "tempId": 2
			    },
			    "3": {
			      "parent": null,
			      "name": "Plantae",
			      "level": 1,
			      "tempId": 3
			    },
			    "4": {
			      "parent": 1,
			      "name": "Arthropoda",
			      "level": 2,
			      "tempId": 4
			    },
			    "5": {
			      "parent": 2,
			      "name": "Phyllostomidae",
			      "level": 5,
			      "tempId": 5
			    },
			    "6": {
			      "parent": 5,
			      "name": "Sturnira",
			      "level": 6,
			      "tempId": 6
			    },
			    "7": {
			      "parent": 6,
			      "name": "lilium",
			      "level": 7,
			      "tempId": 7
			    },
			    "8": {
			      "parent": 3,
			      "name": "Passifloraceae",
			      "level": 5,
			      "tempId": 8
			    },
			    "9": {
			      "parent": 8,
			      "name": "Passiflora",
			      "level": 6,
			      "tempId": 9
			    },
			    "10": {
			      "parent": 3,
			      "name": "Myrtaceae",
			      "level": 5,
			      "tempId": 10
			    },
			    "11": {
			      "parent": 10,
			      "name": "Eugenia",
			      "level": 6,
			      "tempId": 11
			    },
			    "12": {
			      "parent": 5,
			      "name": "Platyrrhinus",
			      "level": 6,
			      "tempId": 12
			    },
			    "13": {
			      "parent": 12,
			      "name": "lineatus",
			      "level": 7,
			      "tempId": 13
			    },
			    "14": {
			      "parent": 3,
			      "name": "Icacinaceae",
			      "level": 5,
			      "tempId": 14
			    },
			    "15": {
			      "parent": 14,
			      "name": "Emmotum",
			      "level": 6,
			      "tempId": 15
			    },
			    "16": {
			      "parent": 15,
			      "name": "nitens",
			      "level": 7,
			      "tempId": 16
			    }
			  },
			  "interaction": {
			    "2": {
			      "intType": 1,
			      "intTag": [
			        1
			      ],
			      "tempId": 2,
			      "subjTaxon": 7,
			      "objTaxon": 9,
			      "location": 1,
			      "citation": 1
			    },
			    "3": {
			      "intType": 1,
			      "intTag": [
			        1
			      ],
			      "tempId": 3,
			      "subjTaxon": 7,
			      "objTaxon": 11,
			      "location": 1,
			      "citation": 1
			    },
			    "4": {
			      "intType": 1,
			      "intTag": [
			        1
			      ],
			      "tempId": 4,
			      "subjTaxon": 13,
			      "objTaxon": 16,
			      "location": 2,
			      "citation": 62
			    }
			  },
			  "intTag": {
			    "1": "Seed",
			    "2": "Leaf",
			    "3": "Flower",
			    "4": "Fruit"
			  },
			  "intType": {
			    "1": "Seed Dispersal",
			    "2": "Consumption",
			    "3": "Pollination",
			    "4": "Visitation"
			  }
			}
		};
	}
}());  /* End of namespacing anonymous function */