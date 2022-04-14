/* uikit-progress */
function uikitHambNav(offset) {
  const nav = document.querySelector('.hamburger');
  window.addEventListener("scroll", navScroll);

  function navScroll() {

    if (pageYOffset > offset) {
      nav.classList.add("btn-scroll-bg");
      nav.firstChild.classList.add('hamb-active');
    } else {
      nav.classList.remove("btn-scroll-bg");
      nav.firstChild.classList.remove('hamb-active');
    }
  } 
}

function uiKitProgressCirclesTwo(speed) {
  const parent = document.querySelectorAll(".uikit-progress-circles-2");

  for (let i = 0; i < parent.length; i++) {
    const progText = parent[i].querySelectorAll(".progText");
    const progress = parent[i].querySelectorAll(".progress");
    const progContainer = parent[i].querySelector(".progress-container");

    let bol = false;

    window.addEventListener("scroll", function () {
      if (pageYOffset > progContainer.offsetTop - 600 && bol === false) {
        //Select All Circles
        for (let i = 0; i < progText.length; i++) {
          progText[i].innerText = 0;
          count = 0;

          progress[i].style.transition = `bottom ${speed * 50}ms`;

          //Dynamic Fill Animation depending on percetage
          progress[i].style.bottom = "100%";
          // progress[i].style.bottom = progText[i].dataset.count - 100 + "%";
          progress[i].style.bottom = progText[i].dataset.count - 122 + "%";
          progress[i].style.left = "-4%";

          //Function for counting up
          function updateCount() {
            target = parseInt(progText[i].dataset.count);

            if (count < target) {
              count++;
              progText[i].innerText = count;
              setTimeout(updateCount, speed); /*Count Speed*/
            } else {
              progText[i].innerText = target + "%";
            }
          }
          updateCount();
          bol = true; /*Onscroll function runs only once when condition is met*/
        }
      }
    });
  }
}

function uiKitSplitScreen1() {
  document.addEventListener('DOMContentLoaded', function() {
  const wrapper = document.querySelectorAll('.uikit-split-screen-1');

  for (let i = 0; i < wrapper.length; i++) {
    const topLayer = wrapper[i].querySelector('.left');
    const handle = wrapper[i].querySelector('.handle');
    let skew = 0;
    let delta = 0;
  
    if(wrapper[i].className.indexOf('uikit-split-screen-1') != -1) {
      skew = 1000;
    }
    
    wrapper[i].addEventListener('mousemove', function(e) {
      delta = (e.clientX - window.innerWidth / 2) * 0.5;
    
      handle.style.left = e.clientX + delta + 'px';
  
      topLayer.style.width = e.clientX + skew + delta + 'px';
    }); 
  }
});
}

