document.addEventListener("DOMContentLoaded",function()
{
	// Clicking on Plus symbol shows the form
	document.querySelector(".channel_button").onclick=function()
	{
		document.querySelector(".channel_name").value="";
		document.querySelector(".channel_cr").style.display="inline";
	};
	// Clicking on Cancel hides the form
	document.querySelector(".channel_button_can").onclick=function()
	{
		document.querySelector(".channel_cr").style.display="none";
	};
	// create a date data type
	let d=new Date();
	const username=localStorage.getItem("username");
	//Connect the socket to the required IP Address
	var socket=io.connect(location.protocol + '//' + document.domain + ':' + location.port);
	//When the socket gets connected,do the following
	socket.on("connect", function()
	{
		//When the user clicks on the submit
		document.querySelector(".message").onsubmit=function()
			{
				//get the timestamp
				const timestamp=d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear()+"  "+d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
				//get the message typed by the user	
				const text=document.querySelector(".input").value;
				//Socket emits a message for the server side to hear
				socket.emit('submit message',{"text":text,"username":username,"timestamp":timestamp});
				//make the textbox empty after posting a message
				document.querySelector(".input").value="";
				//To make sure submit doesnt redirect
				return false;
			};
		document.querySelector(".channels").onsubmit=function()
		{
			const channel_name=document.querySelector(".channel_name").value;
			socket.emit('create channel',{"channel_name":channel_name});
			document.querySelector(".channel_name").value="";
			document.querySelector(".channel_cr").style.display="none";
			return false;
		};
	});
	//When the socket hears the display message
	socket.on("display message",function(data)
	{
		let li = document.createElement('li');
		const msg_username=document.createElement("span");
		const msg_timestamp=document.createElement("span");
		msg_username.class="msg_username";
		msg_timestamp.class="msg_timestamp";
		msg_username.innerHTML=data["username"];
		msg_timestamp.innerHTML=data["timestamp"];
		li.innerHTML = data["text"];
		li.append(msg_username);
		li.append(msg_timestamp);
		li.style.border="2px solid #ffd633";
		li.style.marginBottom="10px";
		document.querySelector(".messages").append(li);
		msg_username.style.marginLeft="10px";
	});
	socket.on("display channel",function(data)
	{
		let li=document.createElement("li");
		let a=document.createElement("a");
		const channel_name=data["channel_name"];
		a.setAttribute("href","{{ url_for('channel',channel_name=channel_name) }}");
		a.innerHTML=channel_name;
		li.append(a);
		document.querySelector(".channels").append(li);
	});
});