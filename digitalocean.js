var needle = require("needle");
var os   = require("os");
var ping = require('ping');
var fs = require('fs');

var config = {};
config.token = process.env.DIGITALOCEAN;
//console.log("Your token is:", config.token);

var headers =
{
	'Content-Type':'application/json',
	Authorization: 'Bearer ' + config.token
};

// Documentation for needle:
// https://github.com/tomas/needle

var client =
{
	listRegions: function( onResponse )
	{
		needle.get("https://api.digitalocean.com/v2/regions", {headers:headers}, onResponse)
	},

	listImages: function (onResponse)
	{
		needle.get("https://api.digitalocean.com/v2/images", {headers:headers}, onResponse)
	},

	createSSHKey: function(sshKeyName, publicKey , onResponse){
		var data = 
		{
			"name": sshKeyName,
			"public_key": publicKey,
		};
		//console.log("\n Public Key Result3: ",publicKey);

		needle.post("https://api.digitalocean.com/v2/account/keys", data, {headers:headers,json:true}, onResponse );
	},

	createDroplet: function (dropletName, region, imageName, sshKeyId, onResponse)
	{
		var data = 
		{
			"name": dropletName,
			"region":region,
			"size":"512mb",
			"image":imageName,
			// Id to ssh_key already associated with account.
			"ssh_keys":[sshKeyId],	//18304399
			//"ssh_keys":null,
			"backups":false,
			"ipv6":false,
			"user_data":null,
			"private_networking":null
		};

		//console.log("Attempting to create: "+ JSON.stringify(data) );

		needle.post("https://api.digitalocean.com/v2/droplets", data, {headers:headers,json:true}, onResponse );
	},

	getDropletInfo: function( dropletId, onResponse)
	{
		var url = `https://api.digitalocean.com/v2/droplets/${dropletId}`
		needle.get(url, {headers:headers}, onResponse)
	},

	deleteDroplet: function( dropletId, onResponse)
	{
		var url = `https://api.digitalocean.com/v2/droplets/${dropletId}`
	
		needle.delete(url, null, {headers:headers,json:true}, onResponse);
	},

};

// #############################################
// #1 Print out a list of available regions
// Comment out when completed.
// https://developers.digitalocean.com/documentation/v2/#list-all-regions
// use 'slug' property
// client.listRegions(function(error, response)
// {
// 	var data = response.body;
// 	//console.log( JSON.stringify(response.body) );

// 	if( response.headers )
// 	{
// 		console.log( "Calls remaining", response.headers["ratelimit-remaining"] );
// 	}

// 	if( data.regions )
// 	{
// 		for(var i=0; i<data.regions.length; i++)
// 		{
// 			console.log( "DC: ",data.regions[i].slug);
// 		}
// 	}
// });


// #############################################
// #2 Extend the client object to have a listImages method
// Comment out when completed.
// https://developers.digitalocean.com/documentation/v2/#images
// - Print out a list of available system images, that are AVAILABLE in a specified region.
// - use 'slug' property

// client.listImages(function(error, response)
// {
// 	var data = response.body;
// 	console.log( JSON.stringify(response.body) );

// 	if( response.headers )
// 	{
// 		console.log( "Calls remaining", response.headers["ratelimit-remaining"] );
// 	}

// 	if( data.images )
// 	{
// 		for(var i=0; i<data.images.length; i++)
// 		{
// 			var di = data.images[i];
// 			console.log( "\nImage: ",di.id);
// 			console.log( "Name: ",di.name);
// 			console.log(" Distribution: ",di.distribution);
// 			console.log( "Regions:: ",di.regions);
// 			// for(var j=0; j<di.regions.length; j++)
// 			// {
// 			// 	console.log (" Data Centers: ", di.regions.regions);
// 			// }
// 		}
// 	}

// });

//##############################################
// #3-a Reading the public rsa key into a varible
var pubKeyFilePath = '/home/vagrant/keys/digital_rsa.pub';
function readPublicKey(){

	return new Promise(function(resolve, reject){
		//do async task here
		fs.readFile(pubKeyFilePath, {encoding: 'utf-8'}, function(err, data){
			if(err){
				console.log(err);
				reject(err);
			}		
			else{
				resolve(data);
				//console.log("\n Public Key: ",publicKey);
				//################################################
				
				
			}
		});

	})
	
}

var getPublicKeyPromise = readPublicKey();
getPublicKeyPromise.then(function(publicKeyResult){
	// ##########9 Insert key into my digitaloceanacoount
	//console.log("\n Public Key Result: ",publicKeyResult);
	var keyName = "SSH_KEY_OCEAN";
	return new Promise(function(resolve, reject){
		//Async Task of api call to add the ssh-key to digital ocean account
		client.createSSHKey(keyName, publicKeyResult, function(err, resp, body)
		{
			//console.log("\n Public Key Result2: ",publicKeyResult);
			//console.log("\n ----- ",resp);
			//console.log("\n #######",body);
		// 	 StatusCode 201 - Means server created key.
			if(!err && resp.statusCode == 201)
			{
				//console.log( JSON.stringify( body, null, 3 ) );
				//console.log( JSON.stringify(body));
				console.log("\n -------- Public RSA Key has been added to your digital ocean account -----");
				console.log("KEYID: ",body.ssh_key.id);
				console.log("KEY NAME: ",body.ssh_key.name);
				
				resolve(body.ssh_key.id);
			}else{
				console.log("Error in creating ssh key:", err);
				reject(err);
			}
		});
	})
	
}, function(publicKeyReadingError){
	console.log(publicKeyReadingError);
}).then(function (sshKeyIDResult){
	//We got the ssh Key ID
	// ############### 3.Create an droplet with the specified name, region, and image

	var name = "khantil"+os.hostname();
	var region = "nyc3"; // Fill one in from #1
	var image = "21669205"; // Fill one in from #2
	//var sshKeyID = "18304399";
		//distribution: ubuntu and name: 16.04.1 x64
	return new Promise(function (resolve, reject){
		client.createDroplet(name, region, image, sshKeyIDResult, function(err, resp, body)
		{
			//console.log(body);
			
		// 	 StatusCode 202 - Means server accepted request.
			 if(!err && resp.statusCode == 202)
			 {
				//console.log("\n Response: \n",JSON.stringify(body));
				//console.log("\n New Digital Ocean Droplet has been created with");
				console.log("Droplet ID: ",body.droplet.id);
				console.log("Droplet Name: ",body.droplet.name);
				console.log("Droplet Kernel Name: ",body.droplet.image.name);
				console.log("Droplet Kernel Distribution: ",body.droplet.image.distribution);
				//console.log("\n#############\n", JSON.stringify( body, null, 3 ) );
				resolve(body.droplet.id);
			 }else{
				 console.log(" Error while creating the droplet: \n",err);
				 reject(err);
			 }
		 });
	})
	

},function(sshKEYAPIError){
	console.log(sshKEYAPIError);
}).then(function(dropletIdResult){
	//Droplet Has Been Created
	// #4 Extend the client to retrieve information about a specified droplet.
	
	//var dropletId = "82222441";  //khchoksi - 80948238
	var myIPAddress;
	// khchoksi - actions =367892252
	client.getDropletInfo( dropletIdResult, function(error, response){
		var data = response.body;
		//console.log( JSON.stringify(response.body) );
		console.log ("\n IP Address of your newly created digital ocean server: ",data.droplet.networks.v4[0].ip_address);
		myIPAddress = data.droplet.networks.v4[0].ip_address;

		//Make entry into inventory file
		//---- Writing Inventory File
		var fileName = '/home/vagrant/inventory';
		//digitalocean_rsa is the private key for the connection to digital ocean accountls
		var inventoryEntry = myIPAddress+' ansible_ssh_user=root '+'ansible_ssh_private_key_file=/home/vagrant/keys/digital_rsa'+'\n';
		//[AppServer]
		//192.168.33.100 ansible_ssh_user=vagrant ansible_ssh_private_key_file=../keys/app.key
		fs.appendFile(fileName, inventoryEntry, function(err) {
			if (err) throw 'error writing file: ' + err;
		   
			console.log("\n ------- Digital Sever Node has been added to Inventory file!-------------------");
		   //  fs.close(fd, function() {
		   //      console.log('wrote the file successfully');
		   //  });
		});
	});
}, function(createDropletAPICallError){
	console.log(createDropletAPICallError);
})




// #############################################

// #############################################


//45.55.43.63 

// #############################################
// #5 In the command line, ping your server, make sure it is alive!
//ping 165.227.83.124
// var hosts = [myIPAddress];
// hosts.forEach(function(host){
//     ping.sys.probe(host, function(isAlive){
//         var msg = isAlive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead';
//         console.log(msg);
//     });
// });

// #############################################
// #6 Extend the client to DESTROY the specified droplet.
// Comment out when done.
// https://developers.digitalocean.com/documentation/v2/#delete-a-droplet
// HINT, use the DELETE verb.
// HINT #2, needle.delete(url, data, options, callback), data needs passed as null.
// No response body will be sent back, but the response code will indicate success.
// Specifically, the response code will be a 204, which means that the action was successful with no returned body data.
// client.deleteDroplet( dropletId, function(error, response){
// 	if(!error && response
// 		.statusCode == 204)
// 	{
// 			console.log("Deleted!");
// 	}
// });

// 	if(!err && resp.statusCode == 204)
// 	{
//			console.log("Deleted!");
// 	}

// #############################################
// #7 In the command line, ping your server, make sure it is dead!
// ping xx.xx.xx.xx
// It could be possible that digitalocean reallocated your IP address to another server, so don't fret it is still pinging.





