const video = $("#camera")[0];
const snap = $("#snap");
const userText = $("#user-score-text");
const SimpsonText = $("#simpson-score-text");

var userScore = 0;
var simpsonScore = 0;

const constraints = {
    audio:false,
    video: {
        width: 750,
        height: 500,
    } 
};

async function init(){
    try{
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        handleSuccess(stream);
    } catch(e){
        alert("Please Turn On your Camera to start playing with Simpson.");
    }
}

function handleSuccess(stream){
    
    window.stream = stream;
    video.srcObject = stream;
    video.load();
    countDown();
}

init();

function changeIcon(iconName){
    const simpsonIcon = $('.choice-icon');
    simpsonIcon.removeClass().addClass('fas ' + iconName + ' fa-10x choice-icon');
}

function getDataUrl(img) {

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 750;
    canvas.height = 500;
    
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg');
}

async function send(base64Image){
    const response = await fetch('https://flaskrps.herokuapp.com/ai/', {
      method: 'POST',
      body:  base64Image,
    });
    const result = await response.json(); 
    return result["result"];
}

function checkWinner(userIndex, randomIndex){
    if(userIndex == 0 && randomIndex == 2 || userIndex == 1 && randomIndex == 0 || userIndex == 2 && randomIndex == 1){
     userScore += 1;
     userText.text(userScore);
    }
    else if(userIndex != randomIndex){
        simpsonScore += 1;
        SimpsonText.text(simpsonScore);
    } 
}

async function countDown(){
    video.play();
    const timerText = $("#timer-text");
    var timeLeft = 3;
    const iconNames = ["fa-hand-rock", "fa-hand-paper","fa-hand-scissors"];
    
    var startTimer = setInterval(async function(){
        if(timeLeft <= 0){
            clearInterval(startTimer);
            
            const randomIndex = Math.floor(Math.random() * 3);
            changeIcon(iconNames[randomIndex]);
            video.pause();
            timerText.text("");

            const dataUrl = getDataUrl(video);
            const userIndex = await send(dataUrl);
            checkWinner(userIndex, randomIndex);

            countDown();

        }
        else{
            changeIcon(iconNames[timeLeft-1]);
            timerText.text(timeLeft);
        }
        timeLeft -=1;
    }, 1000);
}


snap.click(function(){
    let winner;
    if(userScore > simpsonScore){
        winner = "Congratulations! You have Won";
    }
    else if(userScore < simpsonScore){
        winner = "Simpson has won! Try next time."
    }
    else{
        winner = "Game Tied";
    }
    alert(winner);
    userScore = 0;
    simpsonScore = 0;
    window.history.go(-1);
});