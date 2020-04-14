document.addEventListener("DOMContentLoaded",function()
{
	//when the page is duplicated,reload it
	if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD)
	{
    	location.reload();
	}
	//get the username from localstorage
	const username=localStorage.getItem("username");
	//get all the li in the messages ul;
	let messages_items=document.getElementsByClassName("messages_items");
	let len=messages_items.length;
	let count=0;
	for(i = 0; i < len; i++)
	{
		messages_items[i].setAttribute("data-index",count);
		count=count+1;
		//get the username of each message
		let msg_user = messages_items[i].querySelector(".msg_username").innerHTML;
		//remove the @ from the usernames in the message-box
		msg_user=msg_user.split("@")[1];
		//if username of a message matches the local storage username,then add the close icon
		if(msg_user==username)
		{
			const msg_close=document.createElement("span");
			msg_close.classList.add("msg_close");
			msg_close.innerHTML="&times;";
			msg_close.style.position="absolute"
			msg_close.style.top="0";
			msg_close.style.right="4px";
			msg_close.style.fontSize="24px";
			msg_close.style.fontWeight="bold";
			msg_close.style.zIndex="10";
			messages_items[i].append(msg_close);
			msg_close.onmouseenter=function()
			{
				msg_close.style.color="#cccccc";
				msg_close.style.cursor="pointer";
			}
			msg_close.onmouseleave=function()
			{
				msg_close.style.color="black";
			}
			messages_items[i].style.backgroundColor="#80d4ff";
			const arrowtip=messages_items[i].querySelector(".arrowtip");
			arrowtip.style.borderRight="20px solid transparent";
			arrowtip.style.borderTop="20px solid  #80d4ff";
			arrowtip.style.borderBottom="20px solid transparent";
			arrowtip.style.borderLeft="20px solid  #80d4ff";
			arrowtip.style.right="-22px";
			arrowtip.style.top="-0.4px";
		}

	}
	//Scroll to the bottom automatically when the page loads(reloads)
	document.querySelector(".messages").scrollTop = document.querySelector(".messages").scrollHeight - document.querySelector(".messages").clientHeight;
	//Get the localhost address
	let server_add=location.protocol + '//' + document.domain + ':' + location.port;
	const current_url=window.location.href;//for remembering last visited channel url
	localStorage.setItem("lastchannel",current_url);
	//get the current channel name
	const current_channel_name=current_url.split("/")[4];
	//set the background-color of the current channel to blue
	document.querySelector(`li[data-channel=${current_channel_name}]`).style.backgroundColor="#1a75ff";
	// Clicking on Plus symbol shows the form
	document.querySelector(".channel_button").onclick=function()
	{
		document.querySelector(".channel_name").value="";
		document.querySelector(".channel_cr").style.display="inline";
		document.querySelector(".channel_button_cr").style.marginLeft="10px";
	};
	// Clicking on Cancel hides the form
	document.querySelector(".channel_button_can").onclick=function()
	{
		document.querySelector(".channel_cr").style.display="none";
		document.querySelector(".err_msg").style.display="none";
	};
	//If the user has not joined a channel
	const cur_channel_users=document.querySelector("#channel_auth").dataset.users;
	if( !cur_channel_users.includes(username) )
	{
		document.querySelector(".channel_join_button").style.display="inline";
		document.querySelector(".heading").style.opacity=0.2;
		document.querySelector(".messages").style.opacity=0.2;
		document.querySelector(".message").style.display="none";
	}
	// create a date data type
	let d=new Date();
	//Connect the socket to the required IP Address
	var socket=io.connect(server_add);
	//When the socket gets connected,do the following
	socket.on("connect", function()
	{
		//When the user posts a message
		document.querySelector(".message").onsubmit=function()
			{	
				messages_items_length=document.querySelector(".messages").getElementsByTagName("LI").length;
				//when the length of messsages exceed 100,delete the topmost
				if(messages_items_length>=100)
				{
					socket.emit('length exceeded',{"channel":current_channel_name});
				}
				//get the timestamp
				const timestamp=d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear()+"  "+d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
				//get the message typed by the user	
				const text=document.querySelector(".input").value;
				//Socket emits a message for the server side to hear
				socket.emit('submit message',{"text":text,"username":username,"timestamp":timestamp,"channel":current_channel_name});
				//make the textbox empty after posting a message
				document.querySelector(".input").value="";
				//To make sure submit doesnt redirect
				return false;
			};
		//when a channel is created
		document.querySelector(".channels").onsubmit=function()
		{
			document.querySelector(".err_msg").style.display="none";
			const cur_channels=document.getElementsByTagName("LI");
			const channel_input=document.querySelector(".channel_name").value;
			const channel_len=cur_channels.length;
			//if channel name is blank
			if(channel_input == "")
			{
				document.querySelector(".err_msg").innerHTML="Please enter a valid channel name"
				document.querySelector(".err_msg").style.display="inline";
				return false;	
			}
			//if channel name already present
			for(i = 0; i < channel_len; i++)
			{
				let cur_ch=cur_channels[i].innerHTML;
				cur_ch=cur_ch.split(" ")[1];
				if(cur_ch==channel_input)
				{
					document.querySelector(".err_msg").innerHTML="Channel alredy present"
					document.querySelector(".err_msg").style.display="inline";
					return false;	
				}
			}	
			const channel_name=channel_input.toLowerCase();
			socket.emit('create channel',{"channel_name":channel_name});
			document.querySelector(".channel_name").value="";
			document.querySelector(".channel_cr").style.display="none";
			document.querySelector(".err_msg").style.display="none";
			return false;
		};
		//when a user clicks on join channel button
		document.querySelector(".channel_join_button").onclick=function()
		{
			document.querySelector(".channel_join_button").style.display="none";
			socket.emit('join channel',{"channel_name":current_channel_name,"user":username});
		}
		let close_buttons=document.getElementsByClassName("msg_close");
		let close_len=close_buttons.length;
		for(i=0;i<close_len;i++)
		{
			let close_button=close_buttons[i];
			//when a user deletes a message
			close_button.onclick=function()
			{
				let par=close_button.parentElement;
				let par_user=par.querySelector(".msg_username").innerHTML;
				par_user=par_user.split("@")[1];
				let par_text=par.querySelector(".msg_text").innerHTML;
				let par_timestamp=par.querySelector(".msg_timestamp").innerHTML;
				let data_index_value=par.getAttribute("data-index");
				socket.emit("delete message",{"channel_name":current_channel_name,"username":par_user,"text":par_text,"timestamp":par_timestamp,"index":data_index_value});
			};
		}
	});
	//When the client hears the display message brodcast from the server
	socket.on("display message",function(data)
	{
		let li = document.createElement('li');
		const msg_username=document.createElement("span");
		const msg_timestamp=document.createElement("span");
		const msg_text=document.createElement("span");
		msg_username.classList.add("msg_username");
		msg_username.style.color="#660066";
		msg_username.style.float="left";
	    msg_username.style.fontSize="15px";
	    msg_username.style.fontWeight="bold";
		msg_timestamp.classList.add("msg_timestamp");
		msg_timestamp.style.fontSize="15px";
		msg_timestamp.style.fontWeight="bold";
		msg_timestamp.style.float="right";
		msg_username.innerHTML="@"+data["username"];
		msg_timestamp.innerHTML=data["timestamp"];
		msg_text.classList.add("msg_text");
		msg_text.innerHTML=data["text"]
		msg_text.style.fontSize="17px";
		linebreak = document.createElement("br");
		li.append(msg_username);
		li.append(linebreak);
		li.append(msg_text);
		li.append(msg_timestamp);
		const arrowtip=document.createElement("span");
		arrowtip.classList.add("arrowtip");
		arrowtip.style.borderRight="20px solid #f2f2f2";
		arrowtip.style.borderTop="20px solid  #f2f2f2";
		arrowtip.style.borderBottom="20px solid transparent";
		arrowtip.style.borderLeft="20px solid transparent";
		arrowtip.style.position="absolute";
		arrowtip.style.display="table";
		arrowtip.style.right="918px";
		arrowtip.style.top="-0.5px";
		arrowtip.style.zIndex="1";
		arrowtip.style.clear="both";
		arrowtip.style.content="";
		const lastchild=document.querySelector(".messages").lastElementChild;
		if(lastchild==null || lastchild==undefined)
		{
			li.setAttribute("data-index",0);
		}
		else
		{
			let data_index=lastchild.getAttribute("data-index");
			data_index=parseInt(data_index)+1;
			li.setAttribute("data-index",data_index);
		}
		if(data["username"]==username)
		{
			const msg_close=document.createElement("span");
			msg_close.classList.add("msg_close");
			msg_close.innerHTML="&times;";
			msg_close.style.position="absolute"
			msg_close.style.top="0";
			msg_close.style.right="4px";
			msg_close.style.fontSize="24px";
			msg_close.style.fontWeight="bold";
			msg_close.style.zIndex="10";
			li.append(msg_close);
			msg_close.onmouseenter=function()
			{
				msg_close.style.color="#cccccc";
				msg_close.style.cursor="pointer";

			};
			msg_close.onmouseleave=function()
			{
				msg_close.style.color="black";
			};
			msg_close.onclick=function()
			{
				let par=msg_close.parentElement;
				let par_user=par.querySelector(".msg_username").innerHTML;
				par_user=par_user.split("@")[1];
				let par_text=par.querySelector(".msg_text").innerHTML;
				let par_timestamp=par.querySelector(".msg_timestamp").innerHTML;
				let data_index_value=par.getAttribute("data-index");
				socket.emit("delete message",{"channel_name":current_channel_name,"username":par_user,"text":par_text,"timestamp":par_timestamp,"index":data_index_value});
			};
			li.style.backgroundColor="#80d4ff";
			arrowtip.style.borderRight="20px solid transparent";
			arrowtip.style.borderTop="20px solid  #80d4ff";
			arrowtip.style.borderBottom="20px solid transparent";
			arrowtip.style.borderLeft="20px solid  #80d4ff";
			arrowtip.style.right="-22px";
			arrowtip.style.top="-0.4px";
		}
		li.append(arrowtip);
		li.style.marginBottom="10px";
		li.style.fontFamily="Arial, Helvetica, sans-serif";
		document.querySelector(".messages").append(li);
		let messages_scroll=document.querySelector(".messages");
		messages_scroll.scrollTop = messages_scroll.scrollHeight - messages_scroll.clientHeight;
	});
	//Display the channel on client-side after it is created
	socket.on("display channel",function(data)
	{
		let li=document.createElement("li");
		const channel_url=server_add+"/"+"channel"+"/"+data["channel_name"];
		let a=document.createElement("a");
		a.setAttribute("href",channel_url);
		li.innerHTML="# "+data["channel_name"];
		a.appendChild(li);
		document.querySelector(".channels").appendChild(a);
	});
	//when a user joins a channel
	socket.on("channel joined",function()
	{
		document.querySelector(".heading").style.opacity=1;
		document.querySelector(".messages").style.opacity=1;
		document.querySelector(".message").style.display="inline";
	});
	//when messages exceed 100
	socket.on("popped first message",function()
	{
		let messages_ul=document.querySelector(".messages");
		messages_ul.removeChild(messages_ul.childNodes[1]);     
	});
	//when a message gets deleted
	socket.on("message deleted",function(data)
	{
		let index_value=data["index"];
		let messages_ul=document.querySelector(".messages");
		del_msg=messages_ul.querySelector(`li[data-index='${index_value}']`);
		document.querySelector(".messages").removeChild(del_msg);
	});
})