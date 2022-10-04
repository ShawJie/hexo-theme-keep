/* global KEEP */

KEEP.initUtils = () => {
  KEEP.utils = {
    html_root_dom: document.querySelector('html'),
    pageContainer_dom: document.querySelector('.page-container'),
    pageTop_dom: document.querySelector('.page-main-content-top'),
    firstScreen_dom: document.querySelector('.first-screen-container'),
    scrollProgressBar_dom: document.querySelector('.scroll-progress-bar'),
    pjaxProgressBar_dom: document.querySelector('.pjax-progress-bar'),
    pjaxProgressIcon_dom: document.querySelector('.pjax-progress-icon'),
    back2TopButton_dom: document.querySelector('.tool-scroll-to-top'),
    headerWrapper_dom: document.querySelector('.header-wrapper'),

    innerHeight: window.innerHeight,
    pjaxProgressBarTimer: null,
    prevScrollValue: 0,
    fontSizeLevel: 0,
    isHasScrollProgressBar: false,
    isHasScrollPercent: false,
    isHeaderTransparent: false,

    initData() {
      const { scroll, first_screen } = KEEP.theme_config.style
      this.isHasScrollProgressBar = scroll.progress_bar.enable === true
      this.isHasScrollPercent = scroll.percent.enable === true
      const { enable, header_transparent } = first_screen
      this.isHeaderTransparent = enable === true && header_transparent === true
    },

    // Scroll Style Handle
    styleHandleWhenScroll() {
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop
      const scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight
      const clientHeight = window.innerHeight || document.documentElement.clientHeight

      const percent = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)

      if (this.isHasScrollProgressBar) {
        const ProgressPercent = ((scrollTop / (scrollHeight - clientHeight)) * 100).toFixed(3)
        this.scrollProgressBar_dom.style.visibility = percent === 0 ? 'hidden' : 'visible'
        this.scrollProgressBar_dom.style.width = `${ProgressPercent}%`
      }

      if (this.isHasScrollPercent) {
        const percent_dom = this.back2TopButton_dom.querySelector('.percent')
        if (percent === 0 || percent === undefined) {
          this.back2TopButton_dom.classList.remove('show')
        } else {
          this.back2TopButton_dom.classList.add('show')
          percent_dom.innerHTML = percent.toFixed(0)
        }
      }

      // hide header handle
      if (scrollTop > this.prevScrollValue && scrollTop > this.innerHeight) {
        this.pageTop_dom.classList.add('hide')
        if (this.isHeaderTransparent) {
          this.headerWrapper_dom.classList.remove('transparent-1', 'transparent-2')
        }
      } else {
        this.pageTop_dom.classList.remove('hide')
        if (this.isHeaderTransparent) {
          if (scrollTop <= this.headerWrapper_dom.getBoundingClientRect().height) {
            this.headerWrapper_dom.classList.remove('transparent-2')
            this.headerWrapper_dom.classList.add('transparent-1')
          } else if (scrollTop < this.innerHeight) {
            this.headerWrapper_dom.classList.add('transparent-2')
          }
        }
      }
      this.prevScrollValue = scrollTop
    },

    // register window scroll event
    registerWindowScroll() {
      window.addEventListener('scroll', () => {
        // style handle when scroll
        if (this.isHasScrollPercent || this.isHasScrollProgressBar) {
          this.styleHandleWhenScroll()
        }

        // TOC scroll handle
        if (KEEP.theme_config.toc.enable && KEEP.utils.hasOwnProperty('findActiveIndexByTOC')) {
          KEEP.utils.findActiveIndexByTOC()
        }

        // header shrink
        KEEP.utils.headerShrink.headerShrink()
      })
    },

    // toggle show tools list
    toggleShowToolsList() {
      document.querySelector('.tool-toggle-show').addEventListener('click', () => {
        document.querySelector('.side-tools-list').classList.toggle('show')
      })
    },

    // global font adjust
    globalFontAdjust() {
      const fontSize = document.defaultView.getComputedStyle(document.body).fontSize
      const fs = parseFloat(fontSize)

      const initFontSize = () => {
        const styleStatus = KEEP.getStyleStatus()
        if (styleStatus) {
          this.fontSizeLevel = styleStatus.fontSizeLevel
          setFontSize(this.fontSizeLevel)
        }
      }

      const setFontSize = (fontSizeLevel) => {
        this.html_root_dom.style.fontSize = `${fs * (1 + fontSizeLevel * 0.05)}px`
        KEEP.styleStatus.fontSizeLevel = fontSizeLevel
        KEEP.setStyleStatus()
      }

      initFontSize()

      document.querySelector('.tool-font-adjust-plus').addEventListener('click', () => {
        if (this.fontSizeLevel === 5) return
        this.fontSizeLevel++
        setFontSize(this.fontSizeLevel)
      })

      document.querySelector('.tool-font-adjust-minus').addEventListener('click', () => {
        if (this.fontSizeLevel <= 0) return
        this.fontSizeLevel--
        setFontSize(this.fontSizeLevel)
      })
    },

    // toggle content area width
    contentAreaWidthAdjust() {
      const toolExpandDom = document.querySelector('.tool-expand-width')
      const headerContentDom = document.querySelector('.header-content')
      const mainContentDom = document.querySelector('.main-content')
      const iconDom = toolExpandDom.querySelector('i')

      const defaultMaxWidth = KEEP.theme_config.style.content_max_width || '1000px'
      const expandMaxWidth = '90%'
      let headerMaxWidth = defaultMaxWidth

      let isExpand = false

      if (
        KEEP.theme_config.style.first_screen.enable === true &&
        window.location.pathname === '/'
      ) {
        headerMaxWidth = parseInt(defaultMaxWidth) * 1.2 + 'px'
      }

      const setPageWidth = (isExpand) => {
        KEEP.styleStatus.isExpandPageWidth = isExpand
        KEEP.setStyleStatus()
        if (isExpand) {
          iconDom.classList.remove('fa-up-right-and-down-left-from-center')
          iconDom.classList.add('fa-down-left-and-up-right-to-center')
          headerContentDom.style.maxWidth = expandMaxWidth
          mainContentDom.style.maxWidth = expandMaxWidth
        } else {
          iconDom.classList.remove('fa-down-left-and-up-right-to-center')
          iconDom.classList.add('fa-up-right-and-down-left-from-center')
          headerContentDom.style.maxWidth = headerMaxWidth
          mainContentDom.style.maxWidth = defaultMaxWidth
        }
      }

      const initPageWidth = () => {
        const styleStatus = KEEP.getStyleStatus()
        if (styleStatus) {
          isExpand = styleStatus.isExpandPageWidth
          setPageWidth(isExpand)
        }
      }

      initPageWidth()

      toolExpandDom.addEventListener('click', () => {
        isExpand = !isExpand
        setPageWidth(isExpand)
      })
    },

    // go comment anchor
    goComment() {
      this.goComment_dom = document.querySelector('.go-comment')
      if (this.goComment_dom) {
        this.goComment_dom.addEventListener('click', () => {
          document.querySelector('#comment-anchor').scrollIntoView()
        })
      }
    },

    // get dom element height
    getElementHeight(selectors) {
      const dom = document.querySelector(selectors)
      return dom ? dom.getBoundingClientRect().height : 0
    },

    // init first screen height
    initFirstScreenHeight() {
      this.firstScreen_dom && (this.firstScreen_dom.style.height = this.innerHeight + 'px')
    },

    // init page height handle
    initPageHeightHandle() {
      if (this.firstScreen_dom) return
      const temp_h1 = this.getElementHeight('.page-main-content-top')
      const temp_h2 = this.getElementHeight('.page-main-content-middle')
      const temp_h3 = this.getElementHeight('.page-main-content-bottom')
      const allDomHeight = temp_h1 + temp_h2 + temp_h3
      const innerHeight = window.innerHeight
      const pb_dom = document.querySelector('.page-main-content-bottom')
      if (allDomHeight < innerHeight) {
        const marginTopValue = Math.floor(innerHeight - allDomHeight)
        if (marginTopValue > 0) {
          pb_dom.style.marginTop = `${marginTopValue - 2}px`
        }
      }
    },

    // big image viewer
    imageViewer() {
      let isBigImage = false

      const showHandle = (maskDom, isShow) => {
        document.body.style.overflow = isShow ? 'hidden' : 'auto'
        if (isShow) {
          maskDom.classList.add('active')
        } else {
          maskDom.classList.remove('active')
        }
      }

      const imageViewerDom = document.querySelector('.image-viewer-container')
      const targetImg = document.querySelector('.image-viewer-container img')
      imageViewerDom &&
        imageViewerDom.addEventListener('click', () => {
          isBigImage = false
          showHandle(imageViewerDom, isBigImage)
        })

      const imgDoms = document.querySelectorAll('.markdown-body img')

      if (imgDoms.length) {
        imgDoms.forEach((img) => {
          img.addEventListener('click', () => {
            isBigImage = true
            showHandle(imageViewerDom, isBigImage)
            targetImg.setAttribute('src', img.getAttribute('src'))
          })
        })
      } else {
        this.pageContainer_dom.removeChild(imageViewerDom)
      }
    },

    // set how long ago language
    setHowLongAgoLanguage(p1, p2) {
      return p2.replace(/%s/g, p1)
    },

    getHowLongAgo(timestamp) {
      const lang = KEEP.language_ago
      const __Y = Math.floor(timestamp / (60 * 60 * 24 * 30) / 12)
      const __M = Math.floor(timestamp / (60 * 60 * 24 * 30))
      const __W = Math.floor(timestamp / (60 * 60 * 24) / 7)
      const __d = Math.floor(timestamp / (60 * 60 * 24))
      const __h = Math.floor((timestamp / (60 * 60)) % 24)
      const __m = Math.floor((timestamp / 60) % 60)
      const __s = Math.floor(timestamp % 60)

      if (__Y > 0) {
        return this.setHowLongAgoLanguage(__Y, lang.year)
      } else if (__M > 0) {
        return this.setHowLongAgoLanguage(__M, lang.month)
      } else if (__W > 0) {
        return this.setHowLongAgoLanguage(__W, lang.week)
      } else if (__d > 0) {
        return this.setHowLongAgoLanguage(__d, lang.day)
      } else if (__h > 0) {
        return this.setHowLongAgoLanguage(__h, lang.hour)
      } else if (__m > 0) {
        return this.setHowLongAgoLanguage(__m, lang.minute)
      } else if (__s > 0) {
        return this.setHowLongAgoLanguage(__s, lang.second)
      }
    },

    setHowLongAgoInHome() {
      const post = document.querySelectorAll('.home-article-meta-info .home-article-date')
      post &&
        post.forEach((v) => {
          const nowDate = Date.now()
          const postDate = new Date(v.dataset.date.split(' GMT')[0]).getTime()
          v.innerHTML = this.getHowLongAgo(Math.floor((nowDate - postDate) / 1000))
        })
    },

    // loading progress bar start
    pjaxProgressBarStart() {
      this.pjaxProgressBarTimer && clearInterval(this.pjaxProgressBarTimer)
      if (this.isHasScrollProgressBar) {
        this.scrollProgressBar_dom.classList.add('hide')
      }

      this.pjaxProgressBar_dom.style.width = '0'
      this.pjaxProgressIcon_dom.classList.add('show')

      let width = 1
      const maxWidth = 99

      this.pjaxProgressBar_dom.classList.add('show')
      this.pjaxProgressBar_dom.style.width = width + '%'

      this.pjaxProgressBarTimer = setInterval(() => {
        width += 5
        if (width > maxWidth) width = maxWidth
        this.pjaxProgressBar_dom.style.width = width + '%'
      }, 100)
    },

    // loading progress bar end
    pjaxProgressBarEnd() {
      this.pjaxProgressBarTimer && clearInterval(this.pjaxProgressBarTimer)
      this.pjaxProgressBar_dom.style.width = '100%'

      const temp_1 = setTimeout(() => {
        this.pjaxProgressBar_dom.classList.remove('show')
        this.pjaxProgressIcon_dom.classList.remove('show')

        if (this.isHasScrollProgressBar) {
          this.scrollProgressBar_dom.classList.remove('hide')
        }

        const temp_2 = setTimeout(() => {
          this.pjaxProgressBar_dom.style.width = '0'
          clearTimeout(temp_1), clearTimeout(temp_2)
        }, 200)
      }, 200)
    },

    // insert tooltip content dom
    insertTooltipContent() {
      const init = () => {
        // tooltip
        document.querySelectorAll('.tooltip').forEach((element) => {
          const { content } = element.dataset
          if (content) {
            element.insertAdjacentHTML(
              'afterbegin',
              `<span class="tooltip-content">${content}</span>`
            )
          }
        })

        // tooltip-img

        const imgsSet = {}

        const toggleShowImg = (dom, nameIdx) => {
          document.addEventListener('click', () => {
            if (imgsSet[nameIdx].isShowImg) {
              dom.classList.remove('show-img')
              imgsSet[nameIdx].isShowImg = false
            }
          })
        }

        const loadImg = (img, imgLoaded) => {
          const temp = new Image()
          const { src } = img.dataset
          temp.src = src
          temp.onload = () => {
            img.src = src
            img.removeAttribute('lazyload')
            imgLoaded = true
          }
        }

        document.querySelectorAll('.tooltip-img').forEach((dom, idx) => {
          const { imgUrl, name } = dom.dataset
          if (imgUrl) {
            const imgDomClass = `tooltip-img-${name}`
            const nameIdx = `${name}_${idx}`
            const imgDom = `<img class="${imgDomClass}" lazyload data-src="${imgUrl}" alt="${name}">`
            const imgTooltipBox = `<div class="tooltip-img-box">${imgDom}</div>`

            imgsSet[nameIdx] = {
              imgLoaded: false,
              isShowImg: false
            }

            dom.insertAdjacentHTML('afterbegin', imgTooltipBox)
            dom.addEventListener('click', (e) => {
              if (!imgsSet[nameIdx].imgLoaded) {
                loadImg(
                  document.querySelector(`.tooltip-img-box img.${imgDomClass}`),
                  imgsSet[nameIdx].imgLoaded
                )
              }
              imgsSet[nameIdx].isShowImg = !imgsSet[nameIdx].isShowImg
              dom.classList.toggle('show-img')
              e.stopPropagation()
            })

            toggleShowImg(dom, nameIdx)
          }
        })
      }
      setTimeout(() => {
        init()
      }, 1000)
    }
  }

  // init data
  KEEP.utils.initData()

  // init scroll
  KEEP.utils.registerWindowScroll()

  // toggle show tools list
  KEEP.utils.toggleShowToolsList()

  // global font adjust
  KEEP.utils.globalFontAdjust()

  // adjust content area width
  KEEP.utils.contentAreaWidthAdjust()

  // go comment
  KEEP.utils.goComment()

  // init page height handle
  KEEP.utils.initPageHeightHandle()

  // init first screen height
  KEEP.utils.initFirstScreenHeight()

  // big image viewer handle
  KEEP.utils.imageViewer()

  // set how long age in home article block
  KEEP.utils.setHowLongAgoInHome()

  // insert tooltip content dom
  KEEP.utils.insertTooltipContent()
}
