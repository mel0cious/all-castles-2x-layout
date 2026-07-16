import { useState, useRef, useEffect, type RefObject } from 'react'
import './App.css'
import Layout1C from './Layout1C.png'
import Layout2C from './Layout2C.png'

function App() {
  const [player1, setPlayer1] = useState("Bramz")
  const [player2, setPlayer2] = useState("Truman")
  const [player1Seed, setPlayer1Seed] = useState("1")
  const [player2Seed, setPlayer2Seed] = useState("32")  
  const [player1Pronouns, setPlayer1Pronouns] = useState("he/him")
  const [player2Pronouns, setPlayer2Pronouns] = useState("he/him")
  const [player1Country, setPlayer1Country] = useState("us")
  const [player2Country, setPlayer2Country] = useState("jp")
  const [commentator1, setCommentator1] = useState("Commentary: Mel0cious")
  const [commentator2, setCommentator2] = useState("")
  const [commentator1Pronouns, setCommentator1Pronouns] = useState("she/they")
  const [commentator2Pronouns, setCommentator2Pronouns] = useState("")
  const [commentator1Country, setCommentator1Country] = useState("jp")
  const [commentator2Country, setCommentator2Country] = useState("")
  
  const player1NameRef = useRef<HTMLDivElement>(null)
  const player2NameRef = useRef<HTMLDivElement>(null)
  const commentator1InnerRef = useRef<HTMLDivElement>(null)
  const commentator1OuterRef = useRef<HTMLDivElement>(null)
  const commentator2InnerRef = useRef<HTMLDivElement>(null)
  const commentator2OuterRef = useRef<HTMLDivElement>(null)

  const hasCountryCode = (countryCode: string) => countryCode.trim() !== ''

  const adjustNameFontSize = (nameRef: RefObject<HTMLDivElement | null>) => {
    const nameElement = nameRef.current
    if (!nameElement) return

    nameElement.style.fontSize = '50px'

    requestAnimationFrame(() => {
      let currentSize = 50
      const maxWidth = nameElement.clientWidth

      while (currentSize > 12 && nameElement.scrollWidth > maxWidth) {
        currentSize -= 1
        nameElement.style.fontSize = `${currentSize}px`
      }
    })
  }

  useEffect(() => {
    adjustNameFontSize(player1NameRef)

    const handleResize = () => adjustNameFontSize(player1NameRef)
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [player1, player1Pronouns])

  useEffect(() => {
    adjustNameFontSize(player2NameRef)

    const handleResize = () => adjustNameFontSize(player2NameRef)
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [player2, player2Pronouns])

  // Adjust font size for commentator 1
  useEffect(() => {
    if (!commentator1InnerRef.current || !commentator1OuterRef.current) return

    const adjustFontSize = () => {
      const inner = commentator1InnerRef.current
      const outer = commentator1OuterRef.current
      if (!inner || !outer) return

      // Start at max size
      inner.style.fontSize = '50px'

      // Give browser time to render
      requestAnimationFrame(() => {
        let currentSize = 50
        const flagWidth = hasCountryCode(commentator1Country) ? 90 : 0 // 64px flag + spacing + buffer

        // Keep reducing until no overflow
        while (currentSize > 12) {
          const totalWidth = flagWidth + inner.scrollWidth
          const isOverflowing =
            inner.scrollHeight > outer.clientHeight ||
            totalWidth > outer.clientWidth

          if (!isOverflowing) break

          currentSize -= 1
          inner.style.fontSize = currentSize + 'px'
        }
      })
    }

    adjustFontSize()
    window.addEventListener('resize', adjustFontSize)

    return () => window.removeEventListener('resize', adjustFontSize)
  }, [commentator1, commentator1Pronouns, commentator1Country])

  // Adjust font size for commentator 2
  useEffect(() => {
    if (!commentator2InnerRef.current || !commentator2OuterRef.current) return

    const adjustFontSize = () => {
      const inner = commentator2InnerRef.current
      const outer = commentator2OuterRef.current
      if (!inner || !outer) return

      // Start at max size
      inner.style.fontSize = '50px'

      // Give browser time to render
      requestAnimationFrame(() => {
        let currentSize = 50
        const flagWidth = hasCountryCode(commentator2Country) ? 90 : 0 // 64px flag + spacing + buffer

        // Keep reducing until no overflow
        while (currentSize > 12) {
          const totalWidth = flagWidth + inner.scrollWidth
          const isOverflowing =
            inner.scrollHeight > outer.clientHeight ||
            totalWidth > outer.clientWidth

          if (!isOverflowing) break

          currentSize -= 1
          inner.style.fontSize = currentSize + 'px'
        }
      })
    }

    adjustFontSize()
    window.addEventListener('resize', adjustFontSize)

    return () => window.removeEventListener('resize', adjustFontSize)
  }, [commentator2, commentator2Pronouns, commentator2Country])

  // Use for Pronouns
  // If no pronouns, return just name
  function combineNameAndPronouns(name:string, pronouns:string) {
    if (pronouns == "") {
      return name
    }
    else return `${name} (${pronouns})`
  }

  // Yell at me all you want for claude making this function
  function countryCodeToUnicode(code: string): string {
    const specialFlags: Record<string, string> = {
      PRIDE: "1f3f3-fe0f-200d-1f308",
      TRANS: "1f3f3-fe0f-200d-26a7-fe0f",
      CALI: "cali_flag", // for mikethepwnstar
      USCA: "bramz", // for bramz, a hybrid of US/CANADA
      ENG: "1f3f4-e0067-e0062-e0065-e006e-e0067-e007f",
      SCT: "1f3f4-e0067-e0062-e0073-e0063-e0074-e007f",
      WLS: "1f3f4-e0067-e0062-e0077-e006c-e0073-e007f",
    };

    const key = code.toUpperCase();
    if (specialFlags[key]) {
      return specialFlags[key];
    }

    const unicodeParts: string[] = [];
    for (const char of key) {
      const offset = char.charCodeAt(0) - "A".charCodeAt(0);
      const codepoint = 0x1f1e6 + offset;
      unicodeParts.push(codepoint.toString(16));
    }

    return unicodeParts.join("-");
  }
  
  function getEmoji(countryCode: string): string {
    const unicode = countryCodeToUnicode(countryCode);
    return `${import.meta.env.BASE_URL}assets/72x72/${unicode}.png`;
  }

  return (
    <>
      <div className="layout" style={{backgroundImage: `url(${commentator2 ? Layout2C : Layout1C})`}}> {/* Main Visual */}
        <div
          className='outerplayercontainer right'
          id='player1'
          style={{
            gridTemplateColumns: hasCountryCode(player1Country)
              ? '64px minmax(0, 1fr) 64px'
              : 'minmax(0, 1fr) 64px'
          }}
        > {/* Player 1 Name And Seed */}
          {hasCountryCode(player1Country) && <img src={getEmoji(player1Country)} className='country' id='country1'/>}
          <div className='playername' ref={player1NameRef}>{combineNameAndPronouns(player1, player1Pronouns)}</div>
          <div className='seed' id="seed1">{player1Seed}</div>
        </div>
        
        <div
          className='outerplayercontainer left'
          id='player2'
          style={{
            gridTemplateColumns: hasCountryCode(player2Country)
              ? '64px minmax(0, 1fr) 64px'
              : '64px minmax(0, 1fr)'
          }}
        > {/* Player 2 Name And Seed */}
          <div className='seed' id="seed2">{player2Seed}</div>
          <div className='playername' ref={player2NameRef}>{combineNameAndPronouns(player2, player2Pronouns)}</div>
          {hasCountryCode(player2Country) && <img src={getEmoji(player2Country)} className='country' id='country2'/>}
        </div>

        <div
          className='commentary'
          id='commentator1'
          ref={commentator1OuterRef}
          style={{ justifyContent: hasCountryCode(commentator1Country) ? 'space-between' : 'flex-start' }}
        >
          <div
            className='commentaryinner'
            ref={commentator1InnerRef}
            style={{ paddingRight: hasCountryCode(commentator1Country) ? '10px' : '0px' }}
          >
            {combineNameAndPronouns(commentator1, commentator1Pronouns)}
          </div>
          {hasCountryCode(commentator1Country) && <img src={getEmoji(commentator1Country)} className='country'/>}
        </div>
        <div
          className='commentary'
          id='commentator2'
          ref={commentator2OuterRef}
          style={{ justifyContent: hasCountryCode(commentator2Country) ? 'space-between' : 'flex-start' }}
        >
          <div
            className='commentaryinner'
            ref={commentator2InnerRef}
            style={{ paddingRight: hasCountryCode(commentator2Country) ? '10px' : '0px' }}
          >
            {combineNameAndPronouns(commentator2, commentator2Pronouns)}
          </div>
          {hasCountryCode(commentator2Country) && <img src={getEmoji(commentator2Country)} className='country'/>}
        </div>
      </div>

    <div className='controls'>
      <div className='playerinfo'>
        <div className='player1info'>
          <input type='text' value={player1} onChange={(e) => setPlayer1(e.target.value)} />
          <input type='text' value={player1Pronouns} onChange={(e) => setPlayer1Pronouns(e.target.value)} />
          <input type='text' value={player1Country} onChange={(e) => setPlayer1Country(e.target.value)} />
          <input type='text' value={player1Seed} onChange={(e) => setPlayer1Seed(e.target.value)} />
        </div>
        <div className='player2info'>
          <input type='text' value={player2} onChange={(e) => setPlayer2(e.target.value)} />
          <input type='text' value={player2Pronouns} onChange={(e) => setPlayer2Pronouns(e.target.value)} />
          <input type='text' value={player2Country} onChange={(e) => setPlayer2Country(e.target.value)} />
          <input type='text' value={player2Seed} onChange={(e) => setPlayer2Seed(e.target.value)} />
        </div>
      </div>
      <div className='commentatorinfo'>
        <div className='commentator1info'>
          <input type='text' value={commentator1} onChange={e => setCommentator1(e.target.value)} />
          <input type='text' value={commentator1Pronouns} onChange={e => setCommentator1Pronouns(e.target.value)} />
          <input type='text' value={commentator1Country} onChange={e => setCommentator1Country(e.target.value)} />
        </div>
        <div className='commentator2Info'>
          <input type='text' value={commentator2} onChange={e => setCommentator2(e.target.value)} />
          <input type='text' value={commentator2Pronouns} onChange={e => setCommentator2Pronouns(e.target.value)} />
          <input type='text' value={commentator2Country} onChange={e => setCommentator2Country(e.target.value)} />
        </div>
      </div>
      </div>
    </>
  )
}

export default App
