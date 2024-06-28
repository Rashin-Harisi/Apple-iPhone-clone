import { useRef } from "react";
import { hightlightsSlides } from "../constants";
import { useState } from "react";
import { useEffect } from "react";
import { pauseImg, playImg, replayImg } from "../utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger)

const VideoCarousel = () => {
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);
  //console.log(videoDivRef.current);

  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  
  const [loadedData, setLoadedData] = useState([]); // holds metadata of loaded videos

  const { isEnd, startPlay, videoId, isLastVideo, isPlaying } = video;

  useGSAP(() => {
    //animate the #slider element to transition videos horizontally
    gsap.to('#slider',{
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: "power2.inOut"
    })

    //to start playing and update the state when completed.
    gsap.to("#video", {
      scrollTrigger: {
        trigger: "#video",
        toggleActions: "restart none none none",
      },
      onComplete: () => {
        setVideo((pre) => ({
           ...pre, startPlay: true, isPlaying: true
           }));
      },
    });
  }, [isEnd,videoId]);


  useEffect(() => {
    //Controls video playback based on the state and loaded data
    if (loadedData.length > 3) {
      if (!isPlaying) {
        videoRef.current[videoId].pause();
      } else {
        startPlay && videoRef.current[videoId].play();
      }
    }
  }, [videoId, startPlay, isPlaying, loadedData]);

  
  useEffect(() => {

    //Animates the progress bar of the current video using GSAP.
    let currentProgress = 0;
    let span = videoSpanRef.current;

    if (span[videoId]) {
      //animation 
      let anim = gsap.to(span[videoId], {
        onUpdate: () => {
          const progress= Math.ceil(anim.progress() * 100);

          if(progress != currentProgress){
            currentProgress = progress;

            gsap.to(videoDivRef.current[videoId],{
              width: 
                window.innerWidth<760
                ? "10vw"
                : window.innerWidth<1200 ? "10vw"
                : "4vw"
            })
            gsap.to(span[videoId],{
              width: `${currentProgress}%`,
              backgroundColor:"white",
            })
          }
        },
          onComplete: () => {
          if(isPlaying){
            gsap.to(videoDivRef.current[videoId],{
              width: "12px"
            })
            gsap.to(span[videoId],{
              backgroundColor:"#afafaf"
            })
          }
        },
      });

      if(videoId == 0){
        anim.restart();
      }

       const animUpdate = ()=>{
        anim.progress(videoRef.current[videoId].currentTime /
          hightlightsSlides[videoId].videoDuration)
       }
       if(isPlaying){
        gsap.ticker.add(animUpdate)
       }else{
        gsap.ticker.remove(animUpdate)
       }
    }
  }, [videoId, startPlay]);

  const handleProcess = (type, index) => {
    switch (type) {
      case "video-end":
        setVideo((pre) => ({ ...pre, isEnd: true, videoId: index + 1 }));
        break;
      case "video-last":
        setVideo((pre) => ({ ...pre, isLastVideo: true }));
        break;
      case "video-reset":
        setVideo((pre) => ({ ...pre, isLastVideo: false, videoId: 0 }));
        break;
      case "play":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;
      case "pause":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;
      default:
        return video;
    }
  }; 

  const handleLoadedMetaData = (indx,event)=>
    setLoadedData((pre)=>[...pre,event]) // updates the loaded data state when video metadata is loaded.

  return (
    <>
      {/*the whole container of all videos */}
      <div className="flex items-center">
        {hightlightsSlides.map((list, index) => (
          <div key={list.id} id="slider" className="sm:pr-20 pr-10">
            {/*the container of each video */}
            {/*a div for video which have two parts : one for video and the second for text  */}
            <div className="video-carousel_container">
              <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                <video
                  id="video"
                  playsInline={true}
                  preload="auto"
                  muted
                  className={`${list.id === 2 && 'translate-x-44'} pointer-events-none`}
                  ref={(element) => (videoRef.current[index] = element)}
                  onPlay={() => {
                    setVideo((prevVideo) => ({
                      ...prevVideo,
                      isPlaying: true,
                    }));
                  }}
                  onEnded={()=> index !==3 ? handleProcess('video-end', index) : handleProcess("video-last")}
                  onLoadedMetadata={(event)=>handleLoadedMetaData(index,event)}
                >
                  <source src={list.video} type="video/mp4" />
                </video>
              </div>
              <div className="absolute top-12 left-[5%] z-10">
                {list.textLists.map((text) => (
                  <p key={text} className="md:text-2xl text-xl font-medium">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/*container for bottom bar to show the progress of playing each video */}
      <div className="relative flex-center mt-10">
        {/*div contains a span for each video and each span contains another span to show the progress of each video */}
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
          {videoRef.current.map((_, index) => (
            <span
              key={index}
              ref={(element) => (videoDivRef.current[index] = element)}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
            >
              <span
                className="absolute h-full w-full rounded-full"
                ref={(element) => (videoSpanRef.current[index] = element)}
              />
            </span>
          ))}
        </div>
        <button className="control-btn">
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
            onClick={
              isLastVideo
                ? () => handleProcess("video-reset")
                : !isPlaying
                ? () => handleProcess("play")
                : () => handleProcess("pause")
            }
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;
