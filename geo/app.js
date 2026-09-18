

/// Set game params
let raj_nr, attempts, secs, timer_enabled;
let random, map_path, raj;

let pre_guessed_regions = 0;
loadLevel(1);

function loadLevel(index){

	/// Reset params
	raj_nr = pre_guessed_regions;
	attempts = 0;
	secs = 0;
	timer_enabled = true;

	/// Load level data
	let level = levels[index];
	console.log("loadLevel() level", level);
	raj = level.regions;

	/// Load map
	const obj = document.getElementById("map_svg_object");
	obj.data = level.map_path;
	obj.addEventListener("load", () => {
		// setTimeout(startGame, 2000);
		startGame();
	});
}
function startGame(){
	
	console.log("startGame() raj", raj);

	/// Sagatavot rajonus
	for(i=0; i<raj.length; i++){
		
		/// Sagatavot rajona pogu
		let id = raj[i].id;
		let poly = getRegionPolygon(id);
		if(poly){
			poly.classList.add("rajons");
			poly.setAttribute("name", raj[i].name);
			if(raj[i].color) poly.style.fill = raj[i].color; /// Sea has predefined lightblue
			else poly.style.fill = "var(--light-green-color)";

			poly.onclick = createClickHandler(i);
			
			/// Sagatavot mainīgos
			raj[i].attempts = 0;
			raj[i].guessed = false;
		}
	}

	/// Sajaukt rajonus
	random = JSON.parse(JSON.stringify(raj));
	shuffle(random);

	if(pre_guessed_regions){
		for(i=0; i<pre_guessed_regions; i++){
			let region = random[i];
			let region_id = region.id;
			let nr_in_raj = raj.findIndex(function(item) { return item.id === region_id; })
			raj[nr_in_raj].attempts = 1;
			attempts++;
			markRegionAsGuessed(nr_in_raj);
		}
	}

	/// Sākt spēli
	printNextRegionQuestion();
	runTimer();

}
function printNextRegionQuestion(){
	printEmoji("🤔");
	printMsg(`Kur atrodas ${random[raj_nr].name}?`, "white");
}
function printEmoji(emoji){
	big_emoji.innerHTML = emoji;
}

function createClickHandler(i) {
  return function() { clickRaj(i); };
}

function getRegionPolygon(id){
	const svgDoc = map_svg_object.contentDocument;
    const element = svgDoc.getElementById(id);
	return element;
}
function getById(id){
	return document.getElementById(id);
}




function runTimer(){

	if(timer_enabled){
		secs = secs + 1;
		let timer = getById("timer");
		timer.innerHTML = printTime();
		setTimeout(function() {
			runTimer();
		}, 1000);
	}
}
function secondsToTime(secs)
{
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}

function printTime(){
	let hms = secondsToTime(secs);
	let out = "";
	if(hms.h>0){
		out = out + hms.h + " st, ";
	}
	if(hms.m>0){
		out = out + hms.m + " min, ";
	}
	if(hms.s>0){
		out = out + hms.s + "s";
	}
	return out;
	
}

function clickRaj(i){

	console.log("Clicked: " + raj[i].name + " (" + raj[i].id + ")");
	
	
	let click_id = raj[i].id; /// Nospiestā reģiona ID
	let now_id = random[raj_nr].id; /// Vajadzīgās reģiona ID
	let poly = getRegionPolygon(raj[i].id);
	
	
	/// Pieskaitīt mēģinājumu
	if(!raj[i].guessed){
		random[raj_nr].attempts++;
		raj[i].attempts++;
		attempts++;
	}

	/// Pārbaudīt vai pareizi
	if(click_id === now_id){		
		/// Pareizi
	
		/// Atzīmēt atminējumu
		random[raj_nr].guessed = true;
		raj[i].guessed = true;

		/// Iekrāsot atminēto		
		markRegionAsGuessed(i);
		
		/// Pārbaudīt vai spēle beidzas
		raj_nr++;
		if(raj_nr < random.length){		
			/// Ja ir reģioni, sākt nākamo	
			printEmoji("🤩");	
			printMsg("Pareizi! 🎉", "white");
			winAnim();
			setTimeout(() => {
				printNextRegionQuestion();
			}, 1000);
		}else{		
			/// Ja nav reģionu - spēles beigas
			gameOver();
		}
		
	}else{
		/// Ja nepareizi, pārbaudīt vai šis jau ir atminēts un prasīt vēlreiz
		poly.style.fill = "var(--red-color)";
		
		if(raj[i].guessed === true){
			printEmoji("😅");
			printMsg(`Jau atminēts - ${raj[i].name}!`, "white");
			setTimeout(() => {
			
				markRegionAsGuessed(i);
				printNextRegionQuestion();
				
			}, 1000);
		}else{
			
			/// Pateikt, ka nepareizi
			printEmoji("🥺");
			printMsg(`Nepareizi - ${raj[i].name}!`, "white");
			setTimeout(() => {
			
				if(raj[i].color){
					poly.style.fill = raj[i].color;
				}else{
					poly.style.fill = "var(--light-green-color)";
				}
				printNextRegionQuestion();
			}, 1000);
		}
	}
	
}

function markRegionAsGuessed(i){

	raj[i].guessed = true;

	let poly = getRegionPolygon(raj[i].id);	
	if(raj[i].color){
		// poly.style.opacity = 0.5;
	}else{
		poly.style.fill = "var(--dark-green-color)";
	}
}


function gameOver(){

	timer_enabled = false;
	let mistakes = attempts - raj_nr;
	let mistakes_txt = (mistakes === 1 ? " kļūda" : " kļūdas");
	let penalty = mistakes * 10;
	let final_time = 10000 - secs + penalty;

	printEmoji("🥳");
	end_screen.style.display = "block";
	end_screen.innerHTML = `
		<center>
			<br/>
			<br/>
			<br/>
			<span id="win_emoji">🎉🎉🎉🏆🎉🎉🎉</span>
			<h1>UZVARA!!!</h1>
			<br/>Laiks ${secs} sekundes
			<br/>+${penalty} sekundes (${mistakes} ${mistakes_txt})
			<br/>
			<br/>
			<br/>
				<h1>
					Rezultāts: ${final_time} punkti
				</h1>
			<br/><a href='#'onclick='location.reload()'>Atkārtot</a>
		</center>`;
	winAnim("balloons2");

	map.style.opacity = 0.5;
}
function printMsg(text, color){
	let game_question = getById("game_question");
	game_question.innerHTML = text;
	
	let guessed = document.getElementById("guessed");
	guessed.innerHTML = raj_nr + " /" + raj.length;
	
	let mistakes = document.getElementById("mistakes");
	// mistakes.innerHTML = attempts - raj_nr;
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function winAnim(animation_id="balloons"){

	let mili = 5;
	var elem = getById(animation_id);
	elem.style.display = "flex";
	var bottom_pos = -50;
	var left_pos = 25;
	var id = setInterval(frame, mili);
	function frame() {
		if (bottom_pos > 100) {
			elem.style.display = "none";
			clearInterval(id);		
		} else {
			bottom_pos = bottom_pos + 0.5;
			left_pos = left_pos + (Math.random()-0.1)*0.1;
			elem.style.bottom = bottom_pos + '%';
			// elem.style.left = left_pos + '%';
		}
	}
}