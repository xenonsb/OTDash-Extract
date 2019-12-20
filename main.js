// detail portion
function extractDetail(url) {
	return new Promise(function (resolve, reject) {
		var iframe = document.createElement('iframe');
		iframe.src = url;
		iframe.hidden = true;

		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				var nodes = Array.from(mutation.addedNodes);
				for(var node of nodes) {
					if(node.matches && node.matches('table')) {
						resolve(node);
					}
				};
			});
		});

		iframe.onload = function () {
			if (iframe.contentWindow.document.getElementsByTagName('table').length === 2) {
				resolve(iframe.contentWindow.document.getElementsByTagName('table')[0]);
			}
			observer.observe(iframe.contentWindow.document, { childList: true, subtree: true });
		}

		document.body.append(iframe);
	});
}

var allDetailTable = document.createElement('table');
allDetailTable.id = 'details';
var allDetailThead = document.createElement('thead');
var allDetailTbody = document.createElement('tbody');
var allDetailHeader = false;
allDetailTable.appendChild(allDetailThead);
allDetailTable.appendChild(allDetailTbody);
var exportedIDtext = document.createElement('p');
exportedIDtext.innerText = 'Workouts exported: ';

function copyResult(part) {
	var table = document.getElementById(part);
	var selection = window.getSelection();
	var range = document.createRange();
	range.selectNodeContents(table);
	selection.removeAllRanges();
	selection.addRange(range);
	document.execCommand('copy');
}


function extractAll() {
	if (!(window.location.hostname.endsWith('.orangetheoryfitness.com') && window.location.pathname === '/apps/otf/classes')) {
		alert('Wrong location - must be at studioname.orangetheoryfitness.com/apps/otf/classes');
		return
	}
	
	extractNow.innerText = 'Extracting - please wait';
	
	var extractIDs = [...document.getElementsByTagName('input')].filter(x => x.checked).map(y => y.id);

	p = Promise.all(extractIDs.map(id => 
		extractDetail(window.location.href + '/view?id=' + id + '&loc=0')))
		
	p.then(function(tables) { 
		for (var i = 0; i < tables.length; i++) {
			var thId = document.createElement('th');
			thId.innerText = 'Workout ID';
			tables[i].firstChild.firstChild.appendChild(thId);
			
			if (!allDetailHeader) {
				allDetailThead.appendChild(tables[i].firstChild.firstChild);
				allDetailHeader = true;
			}
			
			var rows = [...tables[i].rows].splice(1)
			rows.forEach(function (x) { 
				var tdId = document.createElement('td');
				tdId.innerText = extractIDs[i];
				x.appendChild(tdId);
			});
			
			rows.forEach(x => allDetailTbody.appendChild(x));
			exportedIDtext.innerText += extractIDs[i] + ', ';
		}
		extractIDs.forEach(x => document.getElementById(x).remove())
	});
}

// summary portion
var summary = document.getElementsByTagName('table')[0];
summary.id = 'summary';
var summaryRows = [...summary.getElementsByTagName('tr')];
summaryRows.forEach(function (row) {
	if (row.childNodes[1].innerText === 'My Workouts') {
		row.remove();
	}
	if (row.id) {
		var cell1 = document.createElement('td');
		var cell2 = document.createElement('td');
		var cell3 = document.createElement('td');
		var chkbox = document.createElement('input');
		chkbox.type = 'checkbox';
		chkbox.innerText = row.id;
		chkbox.id = row.id;
		cell1.innerText = window.location.hostname.replace('.orangetheoryfitness.com','');
		cell2.innerText = row.id;
		cell3.appendChild(chkbox);
		row.appendChild(cell1);
		row.appendChild(cell2);
		row.appendChild(cell3);
	}
	else {
		var th1 = document.createElement('th');
		var th2 = document.createElement('th');
		var th3 = document.createElement('th');
		th1.innerText = 'Studio';
		th2.innerText = 'Workout ID';
		th3.innerText = 'Export';
		row.appendChild(th1);
		row.appendChild(th2);
		row.appendChild(th3);
	}
})

var title = document.createElement('h1');
title.innerText = 'Welcome to the OTF workout extraction tool!';
var instructions = document.createElement('p');
instructions.innerText = 'Hey! I revamped this after learning more over the years and now everything auto-extracts.. Just gotta be patient if you have lots of workouts :)';

var extractNow = document.createElement('button');
extractNow.innerText = 'Extract Now';
extractNow.onclick = function () { extractAll(); }

var copySummary = document.createElement('button');
copySummary.innerText = 'Copy Summary';
copySummary.onclick = function () { copyResult('summary'); }

var copyDetails = document.createElement('button');
copyDetails.innerText = 'Copy Details';
copyDetails.onclick = function () { copyResult('details'); }

var selectSome = document.createElement('button');
selectSome.innerText = 'Select first 5 workouts';
selectSome.onclick = function () {
	var chkboxs = document.getElementsByTagName('input');
	[...chkboxs].splice(0, 5).forEach(x => x.checked = true);
}

document.write('<html><body></body></html>');
document.body.appendChild(title);
document.body.appendChild(instructions);
document.body.appendChild(selectSome);
document.body.appendChild(extractNow);
document.body.appendChild(copySummary);
document.body.appendChild(copyDetails);
document.body.appendChild(summary);
document.body.appendChild(exportedIDtext);
document.body.appendChild(allDetailTable);
