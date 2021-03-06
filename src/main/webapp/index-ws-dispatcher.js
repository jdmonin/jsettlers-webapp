/*
 websocket dispatcher for index.html

 Also loads chat-channel.js and game-ui.js asynchronously.

 This file is part of the Java Settlers Web App (JSWeb).

 This file Copyright (C) 2017,2020 Jeremy D Monin (jeremy@nand.net)

 JSWeb is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 JSWeb is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with JSWeb.  If not, see <https://www.gnu.org/licenses/>.
 */

dispatchTo =
{
    // The ordering within this declaration roughly follows that of message.proto message FromServer
    statusText: function(mData)
    {
	if (authSent && ! authOK)
	{
	    var txt = mData.text;
	    var txtSpan = $("#status_txt");
	    if (txt)
		txtSpan.text(": " + txt);
	    else
		txtSpan.text("");
	    var status = mData.sv || "OK";  // default
	    var form = document.forms.login;
	    if (status == "OK_DEBUG_MODE_ON")
	    {
		status = "OK";
		alert("Server's Debug Mode is on.");
	    }
	    else if (status == "OK_SET_NICKNAME")
	    {
		status = "OK";
		nickname = mData.details[0];
		form.nick.value = nickname;
	    }
	    if (status == "OK")
	    {
		authOK = true;
	    } else {
		$("#connect_btn").text("Log In");
		form.nick.focus();
		alert("Login failed: " + txt + " (" + status + ")");
	    }
	    form.connect.disabled = authOK;
	    if (authOK)
		$("#login_pass_row").hide();
	    else
		$("#login_pass_row").show();
	}
    },
    channels: function(mData)
    {
	if (mData.names)
	    listPopulate('chat_channel_list', mData.names, 'Double-click to join this chat channel');
    },
    chNew: function(mData)
    {
	listAdd('chat_channel_list', mData.chName, 'Double-click to join this chat channel');
    },
    chDelete: function(mData)
    {
	listRemove('chat_channel_list', mData.chName);
	if (typeof closeChannelWindow === "function")  // loads late
	    closeChannelWindow(mData.chName, false);
    },
    // for chJoin chLeave etc, see chat-channel.js
    games: function(mData)
    {
	if (mData.game)
	{
	    var gaNames = [];
	    mData.game.forEach(function(gaObj, i) { gaNames[i] = gaObj.gaName; } );
	    listPopulate('game_list', gaNames);
	}
    },
    gaNew: function(mData)
    {
	listAdd('game_list', mData.game.gaName);
	    // TODO note minVersion (may be absent) in case it's higher than our version
    },
    gaDelete: function(mData)
    {
	listRemove('game_list', mData.gaName);
    },
};

function msgDispatch(mType, mData)
{
    console.log("type for dispatch: " + mType);
    console.log("    mData is: " + JSON.stringify(mData));
    var dfunc = dispatchTo[mType];
    if (dfunc)
	dfunc(mData);
}

// Done loading and defining: Enable the Connect button.
$('#connect_btn').prop('disabled', false);

// Now that dispatcher is loaded: In case it's needed soon,
// load chat channel and game board UI functions and message handlers.
// Don't use $.getScript since it disables caching
$.ajax({
    'url': 'chat-channel.js',
    'dataType': 'script',
    'cache': (window.location.host != 'localhost')
    });
$.ajax({
    'url': 'game-ui.js',
    'dataType': 'script',
    'cache': (window.location.host != 'localhost')
    });
