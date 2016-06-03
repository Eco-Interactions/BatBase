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
	function recieveEntityData(msgData) {  console.log("upload data = %O", msgData.data);
		var entities = ['attribution']					//author, publication, attribution
		var data = msgData.data;

		entities.forEach(function(entity){											//check json size being uploaded 
			var dataObj = { entityData: data[entity], refData: postedData };
			postEntityData(entity, dataObj);
		});
	}
	function postEntityData(entity, data) {
    	$.ajax({
			method: "POST",
			url: 'ajax/post',
			success: dataSubmitSucess,
			error: ajaxError,
			data: JSON.stringify({
				entity: entity, 
				data: data
			})
		});
	}



	/*------------- Stubby Methods -------------------------------------------------------------------------*/
	function sendResultStubs() {
		recieveEntityData(getResultStubs());
		// postEntityData("Taxonym", getTaxonymStubs());
	}
	function getTaxonymStubs() {
		return [ {'1': { 'name': 'Taxonys Singularis',
					'tempId': 1 
				}},
		         {'2':{ 'name': 'Repeatus Taxonymicus',
					'tempId': 2 
				}},
		         {'3':{ 'name': 'Creativ Cranius',
					'tempId': 3 
				}},
		         {'4':{ 'name': 'Infini Potentius',
					'tempId': 4 
				}} ];
	}
	function getResultStubs() {
		return { "data": {
				"author": {
				    "2": {
				      "fullName": "Eduardo F Acosta y Lara",
				      "shortName": "Acosta y Lara",
				      "lastName": "Acosta y Lara"
				    },
				    "3": {
				      "fullName": "L Albuja",
				      "shortName": "Albuja",
				      "lastName": "Albuja"
				    },
				    "4": {
				      "fullName": "Stanley M Alcorn",
				      "shortName": "Alcorn",
				      "lastName": "Alcorn"
				    },
				    "87": {
				      "fullName": "Ludmilla M S de Aguiar",
				      "shortName": "de Aguiar",
				      "lastName": "de Aguiar"
				    },
				    "233": {
				      "fullName": "S E McGregor",
				      "shortName": "McGregor",
				      "lastName": "McGregor"
				    },
				    "262": {
				      "fullName": "G Olin",
				      "shortName": "Olin",
				      "lastName": "Olin"
				    }
				},
				"publication": {
				    "1": {
				      "name": "Comunicaciones Zoologicas del Museo de Historia Natural de Montevideo",
				      "publicationType": null,
				      "publisher": null,
				      "tempId": 1
				    },
				    "2": {
				      "name": "Science",
				      "publicationType": null,
				      "publisher": null,
				      "tempId": 2
				    } 
				},
				"attribution": {
				    "1": {
				      "citation": 1,
				      "author": 2
				    },
				    "2": {
				      "citation": 2,
				      "author": 4
				    },
				    "3": {
				      "citation": 2,
				      "author": 233
				    },
				    "4": {
				      "citation": 2,
				      "author": 262
				    },
				    "75": {
				      "citation": 62,
				      "author": 87
				    }
				},
				"citation": {
				    "1": {
				      "description": "Acosta y Lara, E. 1950",
				      "fullText": "Acosta y Lara, E. 1950. Quirópteros de Uruguay. Comunicaciones Zoologicas del Museo de Historia Natural de Montevideo III: 1-74.",
				      "publication": 1,
				      "publicationIssue": null,
				      "publicationVolume": null,
				      "publicationPages": "1-74",
				      "title": "Quirópteros de Uruguay",
				      "year": 1950
				    },
				    "2": {
				      "description": "Alcorn, S. M., S. E. McGregor & G. Olin. 1961",
				      "fullText": "Alcorn, S. M., S. E. McGregor & G. Olin. 1961. Pollination of saguaro cactus by doves, nectar-feeding bats and honey bees. Science 133: 1594-1595.",
				      "publication": 2,
				      "publicationIssue": 133,
				      "publicationVolume": null,
				      "publicationPages": "1594-1595",
				      "title": "Pollination of saguaro cactus by doves, nectar-feeding bats and honey bees",
				      "year": 1961
				    },
				    "62": {
				      "description": "de Aguiar, L. M. 2005",
				      "fullText": "de Aguiar, L. M. 2005. First record on the use of leaves of Solanum lycocarpum (Solanaceae) and fruits of Emmotum nitens (Icacinaceae) by Platyrrhinus lineatus (E. Geoffroy) (Chiroptera: Phyllostomidae) in the Brazilian Cerrado. Rev. Brasil. Zool. 22: 509-510.",
				      "publication": null,
				      "publicationIssue": 22,
				      "publicationVolume": null,
				      "publicationPages": "509-510",
				      "title": "First record on the use of leaves of Solanum lycocarpum (Solanaceae) and fruits of Emmotum nitens (Icacinaceae) by Platyrrhinus lineatus (E. Geoffroy) (Chiroptera: Phyllostomidae) in the Brazilian Cerrado",
				      "year": 2005
				    }
			    },
			    "country": {
				    "1": {
				      "tempId": 1,
				      "name": "Uruguay"
				    },
				    "2": {
				      "tempId": 2,
				      "name": "Brazil"
				    },
				    "3": {
				      "tempId": 3,
				      "name": "USA"
				    },
				    "4": {
				      "tempId": 4,
				      "name": "Cuba"
				    },
				    "5": {
				      "tempId": 5,
				      "name": "Mexico"
				    },
				    "6": {
				      "tempId": 6,
				      "name": "Peru"
				    },
				    "7": {
				      "tempId": 7,
				      "name": "Venezuela"
				    },
				    "8": {
				      "tempId": 8,
				      "name": "Ghana"
				    },
				    "9": {
				      "tempId": 9,
				      "name": "Honduras"
				    },
				    "10": {
				      "tempId": 10,
				      "name": "Costa Rica"
				    },
				    "11": {
				      "tempId": 11,
				      "name": "Panama"
				    }
			    },
				"region": {
				    "1": {
				      "tempId": 1,
				      "name": "South America"
				    },
				    "2": {
				      "tempId": 2,
				      "name": "North America"
				    },
				    "3": {
				      "tempId": 3,
				      "name": "West Africa"
				    },
				    "4": {
				      "tempId": 4,
				      "name": "Central America"
				    }
			    },
				"habitatType": {
				    "1": {
				      "tempId": 1,
				      "name": "Forest"
				    },
				    "2": {
				      "tempId": 2,
				      "name": "Savanna"
				    },
				    "3": {
				      "tempId": 3,
				      "name": "Desert"
				    },
				    "4": {
				      "tempId": 4,
				      "name": "Shrubland"
				    }
				},
				"location": {
				    "1": {
				      "description": "Uruguay-Forest",
				      "elevation": null,
				      "elevationMaxRange": null,
				      "latitude": null,
				      "longitude": null,
				      "country": 1,
				      "regions": [
				        1
				      ],
				      "habitatType": 1
				    },
				    "2": {
				      "description": "Embrapa Cerrados",
				      "elevation": 879,
				      "elevationMaxRange": null,
				      "latitude": "-15.6283333",
				      "longitude": "-47.37083333",
				      "country": 2,
				      "regions": [
				        1
				      ],
				      "habitatType": 2
				    },
				    "3": {
				      "description": "Tucson, AZ",
				      "elevation": 758,
				      "elevationMaxRange": null,
				      "latitude": 32.2217429,
				      "longitude": "-110.926479",
				      "country": 3,
				      "regions": [
				        2
				      ],
				      "habitatType": 3
				    }
				},
				"taxon": {
				    "7": {
				      "level": 7,
				      "displayName": "Sturnira lilium",
				      "parentTaxon": 6
				    },
				    "8": {
				      "level": 5,
				      "displayName": "Passifloraceae",
				      "parentTaxon": 3
				    },
				    "9": {
				      "level": 6,
				      "displayName": "Passiflora",
				      "parentTaxon": 8
				    },
				    "11": {
				      "level": 6,
				      "displayName": "Eugenia",
				      "parentTaxon": 10
				    },
				    "13": {
				      "level": 7,
				      "displayName": "Platyrrhinus lineatus",
				      "parentTaxon": 12
				    },
				    "14": {
				      "level": 5,
				      "displayName": "Icacinaceae",
				      "parentTaxon": 3
				    },
				    "15": {
				      "level": 6,
				      "displayName": "Emmotum",
				      "parentTaxon": 14
				    },
				    "16": {
				      "level": 7,
				      "displayName": "Emmotum nitens",
				      "parentTaxon": 15
				    },
				    "19": {
				      "level": 7,
				      "displayName": "Solanum lycocarpum",
				      "parentTaxon": 18
				    },
				    "20": {
				      "level": 6,
				      "displayName": "Leptonycteris",
				      "parentTaxon": 5
				    },
				    "21": {
				      "level": 7,
				      "displayName": "Leptonycteris nivalis",
				      "parentTaxon": 20
				    },
				    "22": {
				      "level": 5,
				      "displayName": "Cactaceae",
				      "parentTaxon": 3
				    },
				    "23": {
				      "level": 6,
				      "displayName": "Carnegiea",
				      "parentTaxon": 22
				    },
				    "24": {
				      "level": 7,
				      "displayName": "Carnegiea gigantea",
				      "parentTaxon": 23
				    }
			    },
				"interaction": {
				    "2": {
				      "citation": 1,
				      "location": 1,
				      "tags": [
				        1
				      ],
				      "interactionType": 1,
				      "subject": 7,
				      "object": 9
				    },
				    "3": {
				      "citation": 1,
				      "location": 1,
				      "tags": [
				        1
				      ],
				      "interactionType": 1,
				      "subject": 7,
				      "object": 11
				    },
				    "4": {
				      "citation": 62,
				      "location": 2,
				      "tags": [
				        1
				      ],
				      "interactionType": 1,
				      "subject": 13,
				      "object": 16
				    },
				    "5": {
				      "citation": 62,
				      "location": 2,
				      "tags": [
				        2
				      ],
				      "interactionType": 2,
				      "subject": 13,
				      "object": 19
				    },
				    "6": {
				      "citation": 2,
				      "location": 3,
				      "tags": [
				        3
				      ],
				      "interactionType": 3,
				      "subject": 21,
				      "object": 24
				    }
				},
				"intTag": {
				    "1": {
				      "tempId": 1,
				      "tag": "Seed"
				    },
				    "2": {
				      "tempId": 2,
				      "tag": "Leaf"
				    },
				    "3": {
				      "tempId": 3,
				      "tag": "Flower"
				    },
				    "4": {
				      "tempId": 4,
				      "tag": "Fruit"
				    }
				},
				"intType": {
				    "1": {
				      "tempId": 1,
				      "name": "Seed Dispersal"
				    },
				    "2": {
				      "tempId": 2,
				      "name": "Consumption"
				    },
				    "3": {
				      "tempId": 3,
				      "name": "Pollination"
				    },
				    "4": {
				      "tempId": 4,
				      "name": "Visitation"
				    }
				},
				"levels": {
				    "1": {
				      "name": "Kingdom",
				      "ordinal": "10",
				      "pluralName": "Kingdoms"
				    },
				    "2": {
				      "name": "Phylum",
				      "ordinal": "30",
				      "pluralName": "Phyla"
				    },
				    "3": {
				      "name": "Class",
				      "ordinal": "50",
				      "pluralName": "Classes"
				    },
				    "4": {
				      "name": "Order",
				      "ordinal": "70",
				      "pluralName": "Orders"
				    },
				    "5": {
				      "name": "Family",
				      "ordinal": "90",
				      "pluralName": "Families"
				    },
				    "6": {
				      "name": "Genus",
				      "ordinal": "110",
				      "pluralName": "Genera"
				    },
				    "7": {
				      "name": "Species",
				      "ordinal": "130",
				      "pluralName": "Species"
				    }
				}
			}
		};
	}

}());  /* End of namespacing anonymous function */