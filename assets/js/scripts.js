var api = 'http://localhost:8080/api'
var video;
var audio;
var videoPlayer;
var audioPlayer;
var volume = 50;

var kbbltv = new Vue({
    el: '#tv',
    data: {
        volume: volume,
        played: false,
        muted: true
    },
    methods: {
        setVolume: function(newVolume) {
            setVolume(newVolume);
        },
        play: function() {
            playButton();
        },
        pause: function() {
            pauseButton();
        },
        mute: function() {
            mute();
        },
        unMute: function() {
            unMute();
        }
    }
  })

// Get medias playing now
getCurrentMedias = function() {
    Vue.http.get(api + '/timeline')
    .then(function(res) {
        video = null;
        audio = null;
        
        if (res.body.video) {
            video = res.body.video;
            playVideo();
        }
        
        if (res.body.audio) {
            audio = res.body.audio;
            playAudio();
        }
    }, function(err) {
        alert('WTF?!');
    })
}

// Play Video
playVideo = function() {
    videoPlayer = new YT.Player('video', {
        width: '1000',
        height: '750',
        videoId: video.id,
        playerVars: { 'start': video.playAt, 'mute': 1, 'autoplay': 1, 'controls': 0, 'playsinline': 1 },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Play Audio
playAudio = function() {
    audioPlayer = new YT.Player('audio', {
        width: '1',
        height: '1',
        videoId: audio.id,
        playerVars: { 'start': audio.playAt, 'mute': 1, 'autoplay': 1, 'controls': 0, 'playsinline': 1 },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

playButton = function() {
    if (video) {
        videoPlayer.playVideo();
    }

    if (audio) {
        audioPlayer.playVideo();
    }

    kbbltv.played = true;
}

pauseButton = function() {
    if (video && videoPlayer) {
        // added due the faster trigger 
        document.getElementById("video").style.display = "none"; 
        videoPlayer.pauseVideo();
    }

    if (audio) {
        audioPlayer.pauseVideo();
    }

    kbbltv.played = false;
}

setVolume = function(newVolume) {
    volume = newVolume;
    if (audioPlayer) {
        audioPlayer.unMute();
        audioPlayer.setVolume(volume);
    } else if (videoPlayer) {
        videoPlayer.unMute();
        videoPlayer.setVolume(volume);
    }
    kbbltv.volume = volume;
    kbbltv.muted = false;
    colorizeActiveVolume();
}

mute = function() {
    if (audioPlayer) {
        audioPlayer.mute();
    } else if (videoPlayer) {
        videoPlayer.mute();
    }
    kbbltv.muted = true;
    colorizeActiveVolume();
}

unMute = function() {
    if (audioPlayer) {
        audioPlayer.unMute();
    } else if (videoPlayer) {
        videoPlayer.unMute();
    }
    kbbltv.muted = false;
    colorizeActiveVolume();
}

onPlayerReady = function(event) {
    document.getElementById("video").style.display = "none";  
    event.target.playVideo();
}

onPlayerStateChange = function(event) {
    console.log('event change', event);
    if(event.data == 0) {
        // TODO: handle end video
    }

    if (event.data == 1) {
        enableLink(document.getElementById("play-button"));
            document.getElementById("rgb").style.display = "none";
            document.getElementById("video").style.display = "block";     
            kbbltv.played = true;
    }

    if (event.data == 2) {
        enableLink(document.getElementById("play-button"));
        document.getElementById("rgb").style.display = "block";
        document.getElementById("video").style.display = "none";   
    }

    if(event.data == 3){
        disableLink(document.getElementById("play-button"));
        document.getElementById("rgb").style.display = "block";
        document.getElementById("video").style.display = "none"; 
    }
}

function disableLink(link) {
    if(link){
        link.classList.add('isDisabled');
    }
}

function enableLink(link) {
    if(link){
        link.classList.remove('isDisabled');
    }
}

var waitIframeApi = setInterval(function() {
    if (YT) {
        getCurrentMedias();
        clearInterval(waitIframeApi);
    }
}, 100);


// hover volume color
var volumesId = [
    'volume-10',
    'volume-30',
    'volume-50',
    'volume-70',
    'volume-90',
    'volume-100'
];

for(var i = 0; i < volumesId.length;i++) {
    var volumeBtn = document.getElementById(volumesId[i]);
    volumeBtn.addEventListener('mouseover', function() {
        console.log("mouseover")
        for(var z = 0; z < volumesId.length;z++) {
            if(i >= z) {
                var volumeBtnToActive = document.getElementById(volumesId[z]);
                volumeBtnToActive.classList.add("active");
            }
        }

        for(var z = volumesId.length - 1; z > i; z--) {
            var volumeBtnToActive = document.getElementById(volumesId[z]);
            volumeBtnToActive.classList.remove("active");
        }
    });
    volumeBtn.addEventListener('mouseout', function() {
        console.log('mouseout');
        colorizeActiveVolume();
    });
}

colorizeActiveVolume = function() {
    if(!kbbltv.muted) {
        var volumeString = 'volume-'+kbbltv.volume;
        for(var i = 0; i < volumesId.length;i++) {
            if(volumeString === volumesId[i]) {
                console.log('tira o active');
                for(var z = 0; z < volumesId.length;z++) {
                    if(i >= z) {
                        var volumeBtnToActive = document.getElementById(volumesId[z]);
                        volumeBtnToActive.classList.add("active");
                    }
                }
                for(var z = volumesId.length - 1; z > i; z--) {
                    var volumeBtnToActive = document.getElementById(volumesId[z]);
                    volumeBtnToActive.classList.remove("active");
                }
            }
        }
    } else {
        for(var i = 0; i < volumesId.length; i++) {
            var volumeBtnToActive = document.getElementById(volumesId[i]);
            volumeBtnToActive.classList.remove("active");
        }
    }
}

// // tv size
window.addEventListener("resize", function(e) {
    calcTVSize();
});

calcTVSize = function() {
    var tvElement = document.getElementById("video");
    var videoParent = document.getElementById("videoParent");
    var tvWidth;
    console.log(videoParent.clientWidth, window.innerHeight);
    if (videoParent.clientWidth > window.innerHeight * 1.25) {
        tvElement.style.height = "99vh";
        tvElement.style.width = window.innerHeight * 1.25 + "px";
        tvWidth = window.innerHeight * 1.25 + "px";
    } else {
        tvElement.style.width = "100%";
        tvElement.style.height = videoParent.clientWidth * 0.75 + "px";
        tvWidth = videoParent.clientWidth;
    }
    console.log(parseFloat(tvWidth));
}

calcTVSize();