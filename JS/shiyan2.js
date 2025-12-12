var audio = document.getElementById('audioTag');
var playPause = document.getElementsByClassName('playPause')[0];

var recordImg = document.getElementsByClassName('record-img')[0];
var body = document.body;
var musicTitle = document.getElementsByClassName('music-title')[0];
var authorName = document.getElementsByClassName('author-name')[0];
var beforeMusic = document.getElementsByClassName('beforeMusic')[0];
var nextMusic = document.getElementsByClassName('nextMusic')[0];
var playedTime = document.getElementsByClassName('played-time')[0];
var totalTime = document.getElementsByClassName('audio-time')[0];

var progressPlayed = document.getElementsByClassName('progress-played')[0];

var playMode = document.getElementsByClassName('playMode')[0];
var totleProgress = document.getElementsByClassName('progress')[0];

var volumn = document.getElementsByClassName('volumn')[0];
var volumnTogger = document.getElementById('volumn-togger');

var speed = document.getElementsByClassName('speed')[0];

var listIcon = document.getElementsByClassName('list')[0];
var closeList = document.getElementsByClassName('close-list')[0];
var musicList = document.getElementsByClassName('musicList-container')[0];
var musicNameList = document.getElementsByClassName('musics-list')[0];
var musicId = 0;
var musicData = [
    { title: '25216950104', author: '关咏淋', src: './mp3/music0.mp3', cover: './img/record0.jpg', bg: './img/bg0.png' },
    { title: '25216950104', author: '关咏淋', src: './mp3/music1.mp3', cover: './img/record1.jpg', bg: './img/bg1.png' },
    { title: '25216950104', author: '关咏淋', src: './mp3/music2.mp3', cover: './img/record2.jpg', bg: './img/bg2.png' },
    { title: '25216950104', author: '关咏淋', src: './mp3/music3.mp3', cover: './img/record3.jpg', bg: './img/bg3.png' }
]

function initMusic() {
    const music = musicData[musicId];
    
    // 如果音乐文件不存在，尝试加载下一首
    if (!music || !music.src) {
        console.error(`音乐文件不存在: ${musicId}`);
        playNextMusic();
        return;
    }
    
    audio.src = music.src;
    audio.load();
    recordImg.classList.remove('rotate-play');
    
    audio.onloadedmetadata = function() {
        recordImg.style.backgroundImage = `url('${music.cover}')`;
        body.style.backgroundImage = `url('${music.bg}')`;
        refreshRotate();
        musicTitle.innerText = music.title;
        authorName.innerText = music.author;

        if (audio.duration) {
            totalTime.innerText = transTime(audio.duration);
        } else {
            totalTime.innerText = '00:00';
        }
        audio.currentTime = 0;
        updateProgress();
    };
    
    audio.onerror = function() {
        console.error(`无法加载音乐文件: ${music.src}`);
        // 尝试播放下一首
        playNextMusic();
    };
}
initMusic();

function initAndplay() {
    initMusic();
    setTimeout(() => {
        if (audio.src) {
            audio.play().then(() => {
                playPause.classList.remove('icon-play');
                playPause.classList.add('icon-pause');
                rotateRecord();
            }).catch(error => {
                console.error('播放失败:', error);
                // 如果播放失败，尝试下一首
                playNextMusic();
            });
        }
    }, 100);
}

playPause.addEventListener('click',
    function() {
        if (audio.paused) {
            if (audio.src) {
                audio.play();
                rotateRecord();
                playPause.classList.remove('icon-play');
                playPause.classList.add('icon-pause');
            } else {
                // 如果没有音频源，重新初始化
                initAndplay();
            }
        } else {
            audio.pause();
            rotateRecordStop();
            playPause.classList.remove('icon-pause');
            playPause.classList.add('icon-play');
        }
    }
);

function rotateRecord() {
    recordImg.style.animationPlayState = 'running';
}

function rotateRecordStop() {
    recordImg.style.animationPlayState = 'paused';
}

function refreshRotate() {
    recordImg.classList.add('rotate-play');
}

function playNextMusic() {
    musicId++;
    if (musicId >= musicData.length) {
        musicId = 0;
    }
    initAndplay();
}

function playPrevMusic() {
    musicId--;
    if (musicId < 0) {
        musicId = musicData.length - 1;
    }
    initAndplay();
}

nextMusic.addEventListener('click', playNextMusic);

beforeMusic.addEventListener('click', playPrevMusic);

function transTime(value) {
    if (!value || isNaN(value)) return '00:00';
    
    var hour = parseInt(value / 3600);
    var minutes = parseInt((value % 3600) / 60);
    var seconds = parseInt(value % 60);

    if (hour > 0) {
        return `${hour.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
    }
    return `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

audio.addEventListener('timeupdate', updateProgress);

function updateProgress() {
    playedTime.innerText = transTime(audio.currentTime);
    if (audio.duration && !isNaN(audio.duration)) {
        var value = audio.currentTime / audio.duration;
        progressPlayed.style.width = value * 100 + '%';
    }
}

var modeId = 1; // 1:顺序播放, 2:单曲循环, 3:随机播放
playMode.addEventListener('click', function() {
    modeId++;
    if (modeId > 3) {
        modeId = 1;
    }
    playMode.style.backgroundImage = `url('./img/mode${modeId}.png')`;
});

audio.addEventListener('ended', function() {
    if (modeId === 1) { // 顺序播放
        playNextMusic();
    } else if (modeId === 2) { // 单曲循环
        audio.currentTime = 0;
        audio.play();
    } else if (modeId === 3) { // 随机播放
        var oldId = musicId;
        while (true) {
            musicId = Math.floor(Math.random() * musicData.length);
            if (musicId != oldId) {
                break;
            }
        }
        initAndplay();
    }
});

totleProgress.addEventListener('mousedown',
    function(event) {
        if (!audio.paused || audio.currentTime != 0) {
            var pgswidth = totleProgress.getBoundingClientRect().width;
            var rate = event.offsetX / pgswidth;
            if (audio.duration && !isNaN(audio.duration)) {
                audio.currentTime = audio.duration * rate;
                updateProgress();
            }
        }
    }
);

//音量调节
let lastVolumn = 70;
audio.volume = lastVolumn / 100;

function updateVolumn() {
    audio.volume = volumnTogger.value / 100;
}

volumnTogger.addEventListener('input', updateVolumn);

volumn.addEventListener('click', setNoVolumn);

//点击音量按钮
function setNoVolumn() {
    audio.muted = !audio.muted;
    if (audio.muted) {
        lastVolumn = volumnTogger.value;
        volumnTogger.value = 0;
        volumn.style.backgroundImage = `url('./img/静音.png')`;
    } else {
        volumnTogger.value = lastVolumn;
        volumn.style.backgroundImage = `url('./img/音量.png')`;
    }
}

speed.addEventListener('click', function() {
    var speedText = speed.innerText;
    if (speedText == '1.0X') {
        speed.innerText = '1.5X';
        audio.playbackRate = 1.5;
    } else if (speedText == '1.5X') {
        speed.innerText = '2.0X';
        audio.playbackRate = 2.0;
    } else if (speedText == '2.0X') {
        speed.innerText = '0.5X';
        audio.playbackRate = 0.5;
    } else if (speedText == '0.5X') {
        speed.innerText = '1.0X';
        audio.playbackRate = 1.0;
    }
});

listIcon.addEventListener('click',
    function() {
        musicList.classList.remove('list-hide');
        musicList.classList.add('list-show');
        closeList.style.display = 'block';
        musicList.style.display = 'block';
    }
);

closeList.addEventListener('click',
    function() {
        musicList.classList.remove('list-show');
        musicList.classList.add('list-hide');
        closeList.style.display = 'none';
        setTimeout(() => {
            musicList.style.display = 'none';
        }, 1000);
    }
);

//创建列表歌单
function createMusicList() {
    for (let i = 0; i < musicData.length; i++) {
        let div = document.createElement('div');
        div.innerText = `${i + 1}. ${musicData[i].title}`;
        div.className = 'music-item';
        
        if (i === musicId) {
            div.classList.add('active');
        }
        
        musicNameList.appendChild(div);
        div.addEventListener('click', function() {
            musicId = i;
            // 移除所有active类
            document.querySelectorAll('.music-item').forEach(item => {
                item.classList.remove('active');
            });
            // 添加当前active类
            this.classList.add('active');
            initAndplay();
        });
    }
}

document.addEventListener('DOMContentLoaded', createMusicList);

// MV相关功能（如果需要）
var mv = document.getElementsByClassName('MV')[0];
mv.addEventListener('click', function() {
    alert('MV功能正在开发中...');
});