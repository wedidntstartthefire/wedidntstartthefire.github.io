$( document ).ready( function() {

  var vid = document.getElementById( 'bgvid' );
  if ( window.matchMedia( '(prefers-reduced-motion)' ).matches ) {
      vid.removeAttribute( 'autoplay' );
      vid.pause();
  }

  function vidFade() {
    vid.classList.add( 'stopfade' );
  }

  vid.addEventListener( 'ended', function() {
    // only functional if "loop" is removed
    vid.pause();
    // to capture IE10
    vidFade();
  } );

  var $duration = $( '#duration' );
  var $seek = $( '#seek' );
  var $playBtn = $( '#playBtn' );
  var $pauseBtn = $( '#pauseBtn' );
  var $tagCloud = $( '#tagCloud' );
  var $detail = $( '#detail' );
  var iDuration;

  $pauseBtn.addClass( 'hide' );

  var aData = getLyricData();

  var aImages = [];

  preloadImages( aImages, aData );

  var iCounter;
  var currentTime;

  var sound = new Howl( {
    src: [ '/assets/audio/wdstf.mp3' ],
    html5: true,
    onplay: function() {
      iDuration = sound.duration();
      $duration.html( formatTime( Math.round( iDuration ) ) );

      iCounter = setInterval( function() {
        currentTime = sound.seek();

        updateProgress( currentTime, iDuration );

        var msFormatted = formatTimeToMS( currentTime );
        var formattedProgress = formatTime( Math.round( currentTime ) );
        $seek.html( msFormatted );

        $.each( aData, function( index, meta ){
          var thisInfo = aData[ index ];
          if( thisInfo ){
            if( thisInfo.t <= msFormatted ){
              var itemID = getID( thisInfo.value );
              if ( $( '#' + itemID ).length === 0 ) {
                insertItemDetail( thisInfo, itemID, $detail );
                insertTagCloud( thisInfo, itemID, $tagCloud );
                aData.splice( index, 1 );
              }
            }
          }
        } );
      }, 0 );

    },
    onpause: function() {
      clearInterval( iCounter );
      log( formatTimeToMS( currentTime ) )
    },
    onend: function() {
      $playBtn.removeClass( 'hide' );
      $pauseBtn.addClass( 'hide' );
    }
  } );

  // cheat for dev
  // sound.seek( 31 );

  $playBtn.on( 'click', function( e ){
    if( !sound.playing() ){
      sound.play();
      $pauseBtn.removeClass( 'hide' );
      $( this ).addClass( 'hide' );
      if( aData.length < 1 && currentTime === sound.duration() ){
        $tagCloud.html( '<ul></ul>' );
        $detail.html( '' );
      }
    }
  } );

  $pauseBtn.on( 'click', function( e ){
    if( sound.playing() ){
      sound.pause();
      $playBtn.removeClass( 'hide' );
      $( this ).addClass( 'hide' );
    }
  } );

  $( 'body' ).on( 'click', '.tagItem', function ( e ){

    var $element = $( $( this ).data( 'id' ) );
    var $dataEl = $( '.itemData', $element );

    var strHTML = '<p>' + $( '.excerpt', $dataEl ).html() + '</p><p>' + $( '.wikiLink', $dataEl ).html() + '</p>';

    $( '.modal-title', '.modal' ).html( $( 'h1', $dataEl ).html() );
    $( '.modal-body', '.modal' ).html( strHTML );
    $( '.modal' ).modal( 'show' );
    // console.log( strHTML );
  } );


} );

function preloadImages( imageArray, aData ) {
  for( var i = 0; i < aData.length; i++ ){
    imageArray[ i ] = new Image();
    imageArray[ i ].src = '/assets/images/' + aData[ i ].image;
  }
}

function updateProgress( currentTime, duration ){
  var t = currentTime;
  var pct = ( t / duration ) * 100;
  pct = parseInt( pct );
  $( '.progress-bar' ).css( 'width', pct + '%' );
}

function insertTagCloud( item, id, target ){
  $( 'ul', target ).append( '<li><a class="tagItem" data-id="#' + id + '">' + item.value + '</a></li>' );
}

function insertItemDetail( item, id, target ){
  var itemID = id;
  var strDetail = '<div id="' + itemID + '" class="row detailItem"><div class="col-lg-1 col-lg-offset-1 itemImage"><img class="img-responsive" src="/assets/images/' + item.image + '" alt="' + item.value + '"></div><div class="col-lg-9 itemData"><h1 data-id="#' + itemID + '" class="tagItem">' + item.value + '</h1><p class="excerpt">' + item.excerpt + '</p><p class="wikiLink"><a href="' + item.url + '" target="_blank">View on wikipedia</a></p></div></div>';
  $( target ).prepend( strDetail );
}

/**
 * Format the time from seconds to M:SS.
 * @param  {Number} secs Seconds to format.
 * @return {String}      Formatted time.
 */
function formatTime( secs ) {
  var minutes = Math.floor( secs / 60 ) || 0;
  var seconds = ( secs - minutes * 60 ) || 0;
  return minutes + ':' + ( seconds < 10 ? '0' : '' ) + seconds;
}

function formatTimeToMS( secs ){
  var ms = Math.floor( ( secs * 1000 ) % 1000 );
  var s = Math.floor( secs % 60 );
  var m = Math.floor( ( secs * 1000 / ( 1000 * 60 ) ) % 60 );
  var strFormat = "MM:SS:XX";

  if( s < 10 ) s = "0" + s;
  if( m < 10 ) m = "0" + m;
  if( ms < 10 ) ms = "0" + ms;

  strFormat = strFormat.replace( /MM/, m );
  strFormat = strFormat.replace( /SS/, s );
  strFormat = strFormat.replace( /XX/, ms.toString().slice( 0, 2 ) );

  return strFormat;
}

/**
* Shorthand method.. because time-saving
*/
function log( s ){
  console.log( s );
}

/**
* Convert a string to a sluggable value.
*/
function getID( string ){
  var str = string;
  str = str.replace(/\s+/g, '_').toLowerCase();
  str = str.replace(/&rsquo;/g, '_');
  return str;
}

function getLyricData(){

  var lyrics = [
    {
      't': '00:33:10',
      'value': 'Harry Truman',
      'image': 'harry_truman.jpg',
      'url': 'https://en.wikipedia.org/wiki/Harry_S._Truman',
      'excerpt': 'Harry S. Truman (May 8, 1884 - December 26, 1972) was an American politician who served as the 33rd President of the United States (1945-53), assuming that office upon the death of Franklin D. Roosevelt during the waning months of World War II. He is known for launching the Marshall Plan to rebuild the economy of Western Europe, for leading the Cold War against Soviet and Chinese communism by establishing the Truman Doctrine and NATO, and for intervening in the Korean War. In domestic affairs, he was a moderate Democrat whose liberal proposals were a continuation of Franklin Roosevelt&rsquo;s New Deal, but the conservative-dominated Congress blocked most of them. He used the veto power 180 times, which is more than any president since then, and saw 12 overridden by Congress; only Grover Cleveland and Franklin D. Roosevelt used the veto so often, and only Gerald Ford and Andrew Johnson saw so many veto overrides. He also used nuclear weapons to end World War II, desegregated the U.S. armed forces, supported a newly independent Israel, and was a founder of the United Nations.',
      'year': '1949'
    },
    {
      't': '00:33:95',
      'value': 'Doris Day',
      'image': 'doris_day.jpg',
      'url': 'https://en.wikipedia.org/wiki/Doris_Day',
      'excerpt': 'Doris Day (born Doris Mary Ann Kappelhoff; April 3, 1922) is a retired American actress, singer, and animal welfare activist. After she began her career as a big band singer in 1939, her popularity increased with her first hit recording "Sentimental Journey" (1945). After leaving Les Brown & His Band of Renown to embark on a solo career, she recorded more than 650 songs from 1947 to 1967, which made her one of the most popular and acclaimed singers of the 20th century.',
      'year': '1949'
    },
    {
      't': '00:34:75',
      'value': 'Red China',
      'year': '1949',
      'image': 'red_china.png',
      'url': 'https://en.wikipedia.org/wiki/Chinese_Civil_War',
      'excerpt': 'The Chinese Civil War was fought between forces loyal to the Kuomintang (KMT)-led government of the Republic of China, and forces loyal to the Communist Party of China (CPC). The civil war began in August 1927, with Generalissimo Chiang Kai-shek&rsquo;s Northern Expedition, and essentially ended when major hostilities ceased in 1950. It can generally be divided into two stages; the first being from 1927 to 1937, and the second being from 1946 to 1950 with the Second Sino-Japanese War separating them. The war was a major turning point in modern Chinese history, with the CPC gaining control of almost the entirety of Mainland China, establishing the People&rsquo;s Republic of China (PRC) to replace the KMT&rsquo;s Republic of China (ROC). It also caused a lasting political and military standoff between the two sides of the Taiwan Strait, with the ROC in Taiwan and the PRC in mainland China both officially claiming to be the legitimate government of all of China.'
    },
    {
      't': '00:35:75',
      'value': 'Johnny Ray',
      'image': 'johnny_ray.png',
      'year': '1949',
      'url': 'https://en.wikipedia.org/wiki/Johnnie_Ray',
      'excerpt': 'John Alvin Ray (January 10, 1927 - February 24, 1990) was an American singer, songwriter, and pianist. Extremely popular for most of the 1950s, Ray has been cited by critics as a major precursor to what would become rock and roll, for his jazz and blues-influenced music and his animated stage personality. Tony Bennett called Ray the "father of rock and roll," and historians have noted him as a pioneering figure in the development of the genre.'
    },
    {
      't': '00:36:30',
      'value': 'South Pacific',
      'year': '1949',
      'url': 'https://en.wikipedia.org/wiki/South_Pacific_(musical)',
      'excerpt': 'South Pacific is a musical composed by Richard Rodgers, with lyrics by Oscar Hammerstein II and book by Hammerstein and Joshua Logan. The work premiered in 1949 on Broadway and was an immediate hit, running for 1,925 performances. The plot of the musical is based on James A. Michener&rsquo;s Pulitzer Prize-winning 1947 book Tales of the South Pacific and combines elements of several of those stories. Rodgers and Hammerstein believed they could write a musical based on Michener&rsquo;s work that would be financially successful and, at the same time, would send a strong progressive message on racism.',
      'image': 'south_pacific.jpg'
    },
    {
      't': '00:37:12',
      'value': 'Walter Winchell',
      'year': '1949',
      'excerpt': 'Walter Winchell (April 7, 1897 - February 20, 1972) was an American newspaper and radio gossip commentator, famous for attempting to destroy the careers of people both private and public whom he disliked.',
      'url': 'https://en.wikipedia.org/wiki/Walter_Winchell',
      'image': 'walter_winchell.jpg'
    },
    {
      't': '00:38:10',
      'value': 'Joe Dimaggio',
      'image': 'joe_dimaggio.jpg',
      'url': 'https://en.wikipedia.org/wiki/Joe_DiMaggio',
      'excerpt': 'Joseph Paul DiMaggio (November 25, 1914 - March 8, 1999), nicknamed "Joltin&rsquo; Joe" and "The Yankee Clipper", was an American Major League Baseball center fielder who played his entire 13-year career for the New York Yankees',
      'year': '1949'
    },
    {
      't': '00:39:65',
      'value': 'Joe McCarthy',
      'year': '1950',
      'excerpt': 'Joseph Raymond McCarthy (November 14, 1908 - May 2, 1957) was an American politician who was a U.S. Senator from the state of Wisconsin from 1947 until his death in 1957. Beginning in 1950, McCarthy became the most visible public face of a period in which Cold War tensions fueled fears of widespread Communist subversion. He was noted for alleging large numbers of Communists and Soviet spies and sympathizers inside the federal government and elsewhere. Ultimately, the controversy he generated led him to be censured by the U.S. Senate. The term "McCarthyism", coined in 1950 in reference to McCarthy&rsquo;s practices, was soon applied to similar anti-communist activities. Today, the term is used in reference to what are considered demagogic, reckless, and unsubstantiated accusations, as well as public attacks on the character or patriotism of political opponents.',
      'url': 'https://en.wikipedia.org/wiki/Joseph_McCarthy',
      'image': 'joe_mccarthy.jpg'
    },
    {
      't': '00:40:50',
      'value': 'Richard Nixon',
      'year': '1950',
      'url': 'https://en.wikipedia.org/wiki/Richard_Nixon',
      'excerpt': 'Richard Milhous Nixon (January 9, 1913 - April 22, 1994) was an American politician who served as the 37th President of the United States from 1969 until 1974, when he became the only U.S. president to resign from office. He had previously served as the 36th Vice President of the United States from 1953 to 1961 under the presidency of Dwight D. Eisenhower, and prior to that as a U.S. Representative and also Senator from California.',
      'image': 'richard_nixon.jpg'
    },
    {
      't': '00:41:65',
      'value': 'Studebaker',
      'year': '1950',
      'url': 'https://en.wikipedia.org/wiki/Studebaker',
      'excerpt': 'Studebaker (1852 - 1967) was an American wagon and automobile manufacturer based in South Bend, Indiana. Founded in 1852 and incorporated in 1868 under the name of the Studebaker Brothers Manufacturing Company, the company was originally a producer of wagons for farmers, miners, and the military.',
      'image': 'studebaker.gif'
    },
    {
      't': '00:42:81',
      'value': 'Television',
      'year': '1950',
      'url': 'https://en.wikipedia.org/wiki/Television',
      'excerpt': 'Television or TV is a telecommunication medium used for transmitting moving images in monochrome (black-and-white), or in color, and in two or three dimensions and sound. The term can refer to a television set, a television program ("TV show"), or the medium of television transmission. Television is a mass medium for entertainment, education, news, politics, gossip, and advertising.',
      'image': 'television.jpg'
    },
    {
      't': '00:42:90',
      'value': 'North Korea',
      'year': '1950',
      'url': 'https://en.wikipedia.org/wiki/North_Korea',
      'excerpt': 'North Korea , officially the Democratic People&rsquo;s Republic of Korea (DPRK About this sound listen), is a country in East Asia constituting the northern part of the Korean Peninsula. Pyongyang is the nation&rsquo;s capital and largest city. To the north and northwest the country is bordered by China and by Russia along the Amnok (known as the Yalu in China) and Tumen rivers; it is bordered to the south by South Korea, with the heavily fortified Korean Demilitarized Zone (DMZ) separating the two.',
      'image': 'north_korea.png'
    },
    {
      't': '00:43:50',
      'value': 'South Korea',
      'year': '1950',
      'url': 'https://en.wikipedia.org/wiki/South_Korea',
      'excerpt': 'South Korea or Korea, officially the Republic of Korea (ROK; About this sound listen), is a sovereign state in East Asia, constituting the southern part of the Korean Peninsula. Officially, its territory consists of the whole Korean Peninsula and its adjacent islands, which are largely mountainous. South Koreans lead a distinctive urban lifestyle, as half of them live in high-rises concentrated in the Seoul Capital Area with 25 million residents. The capital Seoul is the world&rsquo;s sixth leading global city with the fifth largest economy and is the seventh most sustainable city in the world.',
      'image': 'south_korea.png'
    },
    {
      't': '00:44:45',
      'value': 'Marilyn Monroe',
      'year': '1950',
      'url': 'https://en.wikipedia.org/wiki/Marilyn_Monroe',
      'excerpt': 'Marilyn Monroe (born Norma Jeane Mortenson; June 1, 1926 - August 5, 1962) was an American actress and model. Famous for playing comic "dumb blonde" characters, she became one of the most popular sex symbols of the 1950s and was emblematic of the era&rsquo;s attitudes towards sexuality. Although she was a top-billed actress for only a decade, her films grossed $200 million by the time of her unexpected death in 1962. She continues to be considered a major popular culture icon. Monroe&rsquo;s troubled private life received much attention. She struggled with substance abuse, depression, and anxiety. She had two highly publicized marriages, to retired baseball star Joe DiMaggio and playwright Arthur Miller, both of which ended in divorce. On August 5, 1962, she died at age 36 from an overdose of barbiturates at her home in Los Angeles. Although Monroe&rsquo;s death was ruled a probable suicide, several conspiracy theories have been proposed in the decades following her death.',
      'image': 'marilyn_monroe.jpg'
    },
    {
      't': '00:52:95',
      'value': 'Rosenbergs',
      'url': 'https://en.wikipedia.org/wiki/Julius_and_Ethel_Rosenberg',
      'excerpt': 'Julius and Ethel Rosenberg were United States citizens who were executed on June 19, 1953 after being convicted of committing espionage for the Soviet Union. They were accused of selling the United States&rsquo; top secret plans for building a nuclear bomb to the Soviet Union; at that time the United States was the sole country in the world with the knowledge and resources to build nuclear weapons. They also were accused of providing top-secret radar, sonar, and jet propulsion engines to the Soviet Union.',
      'image': 'rosenbergs.jpg'
    },
    {
      't': '00:53:55',
      'value': 'H-bomb',
      'url': 'https://en.wikipedia.org/wiki/Thermonuclear_weapon',
      'excerpt': 'A thermonuclear weapon is a second generation nuclear weapon design using a secondary nuclear fusion stage consisting of fusion fuel, implosion tamper and sparkplug which is bombarded by the energy released by the detonation of a primary fission bomb within, compressing the fuel material (tritium, deuterium or lithium deuteride) and causing a fusion reaction. Some advanced designs use fast neutrons produced by this second stage to ignite a third fast fission or fusion stage. The fission bomb and fusion fuel are placed near each other in a special radiation-reflecting container called a radiation case that is designed to contain x-rays for as long as possible. The result is greatly increased explosive power when compared to single-stage fission weapons. The device is colloquially referred to as a hydrogen bomb or, an H-bomb, because it employs the fusion of isotopes of hydrogen.',
      'image': 'h_bomb.jpg'
    },
    {
      't': '00:54:75',
      'value': 'Sugar Ray',
      'url': 'https://en.wikipedia.org/wiki/Sugar_Ray_Robinson',
      'excerpt': 'Sugar Ray Robinson (born Walker Smith Jr.; May 3, 1921 - April 12, 1989) was an American professional boxer. Frequently cited as the greatest boxer of all time, Robinson&rsquo;s performances in the welterweight and middleweight divisions prompted sportswriters to create "pound for pound" rankings, where they compared fighters regardless of weight. He was inducted into the International Boxing Hall of Fame in 1990.',
      'image': 'sugar_ray.jpeg'
    },
    {
      't': '00:55:50',
      'value': 'Panmunjom',
      'url': 'https://en.wikipedia.org/wiki/Panmunjom',
      'excerpt': 'Panmunjom, now located in North Hwanghae Province, was a village just north of the de facto border between North and South Korea, where the 1953 Korean Armistice Agreement that paused the Korean War was signed. The building where the armistice was signed still stands. Its name is often used as a metonym for the nearby Joint Security Area (JSA), where discussions between North and South Korea still take place in blue buildings that straddle the Military Demarcation Line. As such, it is considered one of the last vestiges of the Cold War.',
      'image': 'panmunjon.png'
    },
    {
      't': '00:56:60',
      'value': 'Brando',
      'url': 'https://en.wikipedia.org/wiki/Marlon_Brando',
      'excerpt': 'Marlon Brando, Jr. (April 3, 1924 - July 1, 2004) was an American actor, film director and political activist. He is credited with bringing realism to film acting. He helped to popularize the Stanislavski system of acting, studying with Stella Adler in the 1940s. Brando is widely known for his Academy Award-winning performances as Terry Malloy in On the Waterfront (1954) and Vito Corleone in The Godfather (1972), as well as his performances in A Streetcar Named Desire (1951), Viva Zapata! (1952), Julius Caesar (1953), The Wild One (1953), Guys and Dolls (1955), Sayonara (1957), Reflections in a Golden Eye (1967), Last Tango in Paris (1972), and Apocalypse Now (1979). Brando was also an activist for many causes, notably the Civil Rights Movement and various Native American movements.',
      'image': 'brando.jpg'
    },
    {
      't': '00:57:20',
      'value': 'The King and I',
      'url': 'https://en.wikipedia.org/wiki/The_King_and_I',
      'excerpt': 'The King and I is the fifth musical by the team of composer Richard Rodgers and dramatist Oscar Hammerstein II. It is based on Margaret Landon&rsquo;s novel, Anna and the King of Siam (1944), which is in turn derived from the memoirs of Anna Leonowens, governess to the children of King Mongkut of Siam in the early 1860s. The musical&rsquo;s plot relates the experiences of Anna, a British schoolteacher hired as part of the King&rsquo;s drive to modernize his country. The relationship between the King and Anna is marked by conflict through much of the piece, as well as by a love to which neither can admit. The musical premiered on March 29, 1951, at Broadway&rsquo;s St. James Theatre. It ran for nearly three years, making it the fourth longest-running Broadway musical in history at the time, and has had many tours and revivals.',
      'image': 'the_king_and_i.jpeg'
    },
    {
      't': '00:58:10',
      'value': 'The Catcher In The Rye',
      'url': 'https://en.wikipedia.org/wiki/The_Catcher_in_the_Rye',
      'excerpt': 'The Catcher in the Rye is a 1951 novel by J. D. Salinger. A controversial novel originally published for adults, it has since become popular with adolescent readers for its themes of teenage angst and alienation. It has been translated into almost all of the world&rsquo;s major languages. Around 1 million copies are sold each year with total sales of more than 65 million books. The novel&rsquo;s protagonist Holden Caulfield has become an icon for teenage rebellion. The novel also deals with complex issues of innocence, identity, belonging, loss, and connection.',
      'image': 'the_catcher_in_the_rye.jpg'
    },
    {
      't': '00:59:50',
      'value': 'Eisenhower',
      'url': 'https://en.wikipedia.org/wiki/Dwight_D._Eisenhower',
      'excerpt': 'Dwight David "Ike" Eisenhower (October 14, 1890 - March 28, 1969) was an American politician and Army general who served as the 34th President of the United States from 1953 until 1961. He was a five-star general in the United States Army during World War II and served as Supreme Commander of the Allied Expeditionary Forces in Europe. He was responsible for planning and supervising the invasion of North Africa in Operation Torch in 1942-43 and the successful invasion of France and Germany in 1944-45 from the Western Front.',
      'image': 'eisenhower.jpg'
    },
    {
      't': '01:00:50',
      'value': 'Vaccine',
      'url': 'https://en.wikipedia.org/wiki/Vaccine',
      'excerpt': 'A vaccine is a biological preparation that provides active acquired immunity to a particular disease. A vaccine typically contains an agent that resembles a disease-causing microorganism and is often made from weakened or killed forms of the microbe, its toxins or one of its surface proteins. The agent stimulates the body&rsquo;s immune system to recognize the agent as a threat, destroy it, and recognize and destroy any of these microorganisms that it later encounters. Vaccines can be prophylactic (example: to prevent or ameliorate the effects of a future infection by a natural or "wild" pathogen), or therapeutic (e.g., vaccines against cancer are being investigated).',
      'image': 'vaccine.jpg'
    },
    {
      't': '01:01:25',
      'value': 'England&rsquo;s got a new queen',
      'url': 'https://en.wikipedia.org/wiki/Elizabeth_II',
      'excerpt': 'Elizabeth II (Elizabeth Alexandra Mary; born 21 April 1926) has been Queen of the United Kingdom, Canada, Australia, and New Zealand since 6 February 1952. She is Head of the Commonwealth and Queen of 12 countries that have become independent since her accession: Jamaica, Barbados, the Bahamas, Grenada, Papua New Guinea, Solomon Islands, Tuvalu, Saint Lucia, Saint Vincent and the Grenadines, Belize, Antigua and Barbuda, and Saint Kitts and Nevis.',
      'image': 'englands_got_a_new_queen.JPG'
    },
    {
      't': '01:03:10',
      'value': 'Marciano',
      'url': 'https://en.wikipedia.org/wiki/Rocky_Marciano',
      'excerpt': 'Rocco Francis Marchegiano (September 1, 1923 - August 31, 1969), best known as Rocky Marciano, was an American professional boxer who competed from 1947 to 1955, and held the world heavyweight title from 1952 to 1956. He went undefeated in his career and defended the title six times, against Jersey Joe Walcott, Roland La Starza, Ezzard Charles (twice), Don Cockell and Archie Moore. Known for his relentless fighting style, punching power, stamina and iron chin, Marciano has been ranked by many boxing historians as one of the best heavyweight boxers of all time. His knockout-to-win percentage of 87.75 remains one of the highest in heavyweight boxing history.',
      'image': 'marciano.jpg'
    },
    {
      't': '01:03:58',
      'value': 'Liberace',
      'url': 'https://en.wikipedia.org/wiki/Liberace',
      'excerpt': 'Wladziu Valentino Liberace (May 16, 1919 - February 4, 1987), mononymously known as Liberace, was an American pianist, singer, and actor. A child prodigy and the son of working-class immigrants, Liberace enjoyed a career spanning four decades of concerts, recordings, television, motion pictures, and endorsements. At the height of his fame, from the 1950s to the 1970s, Liberace was the highest-paid entertainer in the world, with established residencies in Las Vegas, and an international touring schedule. Liberace embraced a lifestyle of flamboyant excess both on and off stage, acquiring the sobriquet "Mr. Showmanship".',
      'image': 'liberace.jpg'
    },
    {
      't': '01:04:50',
      'value': 'Santayana Goodbye',
      'url': 'https://en.wikipedia.org/wiki/George_Santayana',
      'excerpt': 'Jorge Agustin Nicolas Ruiz de Santayana y Borras, known in English as George Santayana (December 16, 1863 - September 26, 1952), was a philosopher, essayist, poet, and novelist. Originally from Spain, Santayana was raised and educated in the United States from the age of eight and identified himself as an American, although he always kept a valid Spanish passport. He wrote in English and is generally considered an American man of letters. At the age of forty-eight, Santayana left his position at Harvard and returned to Europe permanently, never to return to the United States. His last wish was to be buried in the Spanish pantheon in Rome.',
      'image': 'santayana.jpg'
    },
    {
      't': '01:19:55',
      'value': 'Joseph Stalin',
      'url': 'https://en.wikipedia.org/wiki/Joseph_Stalin',
      'excerpt': 'Joseph Vissarionovich Stalin (18 December 1878 - 5 March 1953) was a Soviet revolutionary, politician and political theorist. He governed the Soviet Union from the mid-1920s until his death in 1953. In this capacity, he served as the Premier of the Soviet Union from 1941 to 1953 and as General Secretary of the Central Committee of the Communist Party of the Soviet Union from 1922 to 1952. Ideologically a Marxist and a Leninist, he helped to formalise these ideas as Marxism-Leninism while his own policies and theories became known as Stalinism.',
      'image': 'joseph_stalin.jpg'
    },
    {
      't': '01:20:14',
      'value': 'Malenkov',
      'url': 'https://en.wikipedia.org/wiki/Georgy_Malenkov',
      'excerpt': 'Georgy Maximilianovich Malenkov (8 January 1902 - 14 January 1988) was a Soviet politician and Communist Party leader. His family connections with Vladimir Lenin sped his promotion in the party, and in 1925 he was put in charge of the party records. This brought him into close association with Joseph Stalin, and he was heavily involved in the purges of the 1930s. During World War II, he was given sole responsibility for the Soviet missile program. Later he gained favour with Stalin by discrediting Marshal Georgy Zhukov for supposed disloyalty, and supporting Stalin&rsquo;s campaign to erase all the glories of Leningrad in the public mind, in order to promote Moscow as the cultural capital. On Stalin&rsquo;s death in 1953, Malenkov was briefly party leader, but was soon replaced by Nikita Khrushchev, with Malenkov as premier, as the party did not want both functions entrusted to the same person. His two-year term ended in failure. He was expelled from the Politburo in 1957. In 1961 he was expelled from the party and exiled to Kazakhstan.',
      'image': 'malenkov.jpg'
    },
    {
      't': '01:21:10',
      'value': 'Nasser',
      'url': 'https://en.wikipedia.org/wiki/Gamal_Abdel_Nasser',
      'excerpt': 'Gamal Abdel Nasser Hussein (15 January 1918 - 28 September 1970) was the second President of Egypt, serving from 1956 until his death. Nasser led the 1952 overthrow of the monarchy and introduced far-reaching land reforms the following year. Following a 1954 attempt on his life by a Muslim Brotherhood member, he cracked down on the organization, put President Muhammad Naguib under house arrest, and assumed executive office, officially becoming president in June 1956.',
      'image': 'nasser.jpg'
    },
    {
      't': '01:21:85',
      'value': 'Prokofiev',
      'url': 'https://en.wikipedia.org/wiki/Sergei_Prokofiev',
      'excerpt': 'Sergei Sergeyevich Prokofiev (27 April 1891 - 5 March 1953) was a Soviet composer, pianist and conductor. As the creator of acknowledged masterpieces across numerous musical genres, he is regarded as one of the major composers of the 20th century. His works include such widely heard works as the March from The Love for Three Oranges, the suite Lieutenant Kije, the ballet Romeo and Juliet - from which "Dance of the Knights" is taken - and Peter and the Wolf. Of the established forms and genres in which he worked, he created - excluding juvenilia - seven completed operas, seven symphonies, eight ballets, five piano concertos, two violin concertos, a cello concerto, a Symphony-Concerto for cello and orchestra, and nine completed piano sonatas.',
      'image': 'prokofiev.jpg'
    },
    {
      't': '01:23:20',
      'value': 'Rockefeller',
      'url': 'https://en.wikipedia.org/wiki/Winthrop_Rockefeller',
      'excerpt': 'Winthrop Rockefeller (May 1, 1912 - February 22, 1973) was an American politician and philanthropist, who served as the first Republican Governor of Arkansas since Reconstruction. He was a third-generation member of the Rockefeller family.',
      'image': 'rockefeller.jpg'
    },
    {
      't': '01:23:90',
      'value': 'Campanella',
      'url': 'https://en.wikipedia.org/wiki/Roy_Campanella',
      'excerpt': 'Roy Campanella (November 19, 1921 - June 26, 1993), nicknamed "Campy", was an American baseball player, primarily as a catcher. The Philadelphia native played for the Negro leagues and Mexican League for several seasons before entering the minor leagues in 1946. He made his Major League Baseball (MLB) debut in 1948. His playing career ended in 1958 when he was paralyzed by an automobile accident. Widely considered to be one of the greatest catchers in the history of the game, Campanella played for the Brooklyn Dodgers in the 1940s and 1950s. After he retired as a player, Campanella held positions in scouting and community relations with the Dodgers. He was inducted into the Baseball Hall of Fame in 1969.',
      'image': 'campanella.jpg'
    },
    {
      't': '01:24:55',
      'value': 'Communist Bloc',
      'url': 'https://en.wikipedia.org/wiki/Eastern_Bloc',
      'excerpt': 'The Eastern Bloc was the group of socialist states of Central and Eastern Europe, generally the Soviet Union and the countries of the Warsaw Pact. The terms Communist Bloc and Soviet Bloc were also used to denote groupings of states aligned with the Soviet Union, although these terms might include states outside Central and Eastern Europe.',
      'image': 'communist_bloc.png'
    },
    {
      't': '01:26:25',
      'value': 'Roy Cohn',
      'url': 'https://en.wikipedia.org/wiki/Roy_Cohn',
      'excerpt': 'Roy Marcus Cohn (February 20, 1927 - August 2, 1986) was an American attorney. During Senator Joseph McCarthy&rsquo;s investigations into Communist activity in the United States during the Second Red Scare, Cohn served as McCarthy&rsquo;s chief counsel and gained special prominence during the Army-McCarthy hearings. He was also known for being a U.S. Department of Justice prosecutor at the espionage trial of Julius and Ethel Rosenberg and later for representing Donald Trump during his early business career.',
      'image': 'roy_cohn.jpg'
    },
    {
      't': '01:26:95',
      'value': 'Juan Peron',
      'url': 'https://en.wikipedia.org/wiki/Juan_Per%C3%B3n',
      'excerpt': 'Juan Domingo Peron (8 October 1895 - 1 July 1974) was an Argentine lieutenant general and politician. After serving in several government positions, including Minister of Labour and Vice President, he was thrice elected President of Argentina, serving from June 1946 to September 1955, when he was overthrown in a coup d&rsquo;etat, and then from October 1973 until his death in July 1974. During his first presidential term (1946-52), Peron was supported by his second wife, Eva Duarte ("Evita"), and the two were immensely popular among many Argentines. Eva died in 1952, and Peron was elected to a second term, serving from 1952 until 1955. During the following period of two military dictatorships, interrupted by two civilian governments, the Peronist party was outlawed and Peron was exiled. When the left-wing Peronist Hector Campora was elected President in 1973, Peron returned to Argentina and was soon after elected President for a third time. His third wife, Maria Estela Martinez, known as Isabel Peron, was elected as Vice President on his ticket and succeeded him as President upon his death in 1974.',
      'image': 'juan_peron.jpg'
    },
    {
      't': '01:27:75',
      'value': 'Toscanini',
      'url': 'https://en.wikipedia.org/wiki/Arturo_Toscanini',
      'excerpt': 'Arturo Toscanini (March 25, 1867 - January 16, 1957) was an Italian conductor. He was one of the most acclaimed musicians of the late 19th and of the 20th century, renowned for his intensity, his perfectionism, his ear for orchestral detail and sonority, and his eidetic memory. He was at various times the music director of La Scala in Milan, the Metropolitan Opera in New York, and the New York Philharmonic Orchestra. Later in his career he was appointed the first music director of the NBC Symphony Orchestra (1937-54), and this led to his becoming a household name (especially in the United States) through his radio and television broadcasts and many recordings of the operatic and symphonic repertoire.',
      'image': 'toscanini.jpg'
    },
    {
      't': '01:29:10',
      'value': 'Dacron',
      'url': 'https://en.wikipedia.org/wiki/Polyethylene_terephthalate',
      'excerpt': 'Polyethylene terephthalate (sometimes written poly(ethylene terephthalate)), commonly abbreviated PET, PETE, or the obsolete PETP or PET-P, is the most common thermoplastic polymer resin of the polyester family and is used in fibers for clothing, containers for liquids and foods, thermoforming for manufacturing, and in combination with glass fiber for engineering resins. It may also be referred to by the brand name Dacron; in Britain, Terylene; or, in Russia and the former Soviet Union, Lavsan.',
      'image': 'dacron.jpg'
    },
    {
      't': '01:29:50',
      'value': 'Dien Bien Phu Falls',
      'url': 'https://en.wikipedia.org/wiki/Battle_of_Dien_Bien_Phu',
      'excerpt': 'The Battle of Dien Bien Phu was the climactic confrontation of the First Indochina War between the French Union&rsquo;s French Far East Expeditionary Corps and Viet Minh communist-nationalist revolutionaries. It was, from the French view before the event, a set piece battle to draw out the Vietnamese and destroy them with superior firepower. The battle occurred between March and May 1954 and culminated in a comprehensive French defeat that influenced negotiations underway at Geneva among several nations over the future of Indochina.',
      'image': 'dien_bien_phu_falls.png'
    },
    {
      't': '01:30:90',
      'value': 'Rock Around the Clock',
      'url': 'https://en.wikipedia.org/wiki/Rock_Around_the_Clock',
      'excerpt': '"Rock Around the Clock" is a rock and roll song in the 12-bar blues format written by Max C. Freedman and James E. Myers (the latter under the pseudonym "Jimmy De Knight") in 1952. The best-known and most successful rendition was recorded by Bill Haley & His Comets in 1954 for American Decca. It was a number one single on both the US and UK charts and also re-entered the UK Singles Chart in the 1960s and 1970s.',
      'image': 'rock_around_the_clock.jpg'
    },
    {
      't': '01:32:75',
      'value': 'Einstein',
      'url': 'https://en.wikipedia.org/wiki/Albert_Einstein',
      'excerpt': 'Albert Einstein (14 March 1879 - 18 April 1955) was a German-born theoretical physicist. He developed the theory of relativity, one of the two pillars of modern physics (alongside quantum mechanics). Einstein&rsquo;s work is also known for its influence on the philosophy of science. Einstein is best known by the general public for his mass–energy equivalence formula E = mc2 (which has been dubbed "the world&rsquo;s most famous equation"). He received the 1921 Nobel Prize in Physics "for his services to theoretical physics, and especially for his discovery of the law of the photoelectric effect", a pivotal step in the evolution of quantum theory.',
      'image': 'einstein.jpg'
    },
    {
      't': '01:33:45',
      'value': 'James Dean',
      'url': 'https://en.wikipedia.org/wiki/James_Dean',
      'excerpt': 'James Byron Dean (February 8, 1931 - September 30, 1955) was an American actor. He is remembered as a cultural icon of teenage disillusionment and social estrangement, as expressed in the title of his most celebrated film, Rebel Without a Cause (1955), in which he starred as troubled teenager Jim Stark. The other two roles that defined his stardom were loner Cal Trask in East of Eden (1955) and surly ranch hand Jett Rink in Giant (1956). Dean&rsquo;s premature death in a car crash cemented his legendary status. He became the first actor to receive a posthumous Academy Award nomination for Best Actor, and remains the only actor to have had two posthumous acting nominations',
      'image': 'james_dean.jpg'
    },
    {
      't': '01:34:30',
      'value': 'Brooklyn&rsquo;s got a winning team',
      'url': 'https://en.wikipedia.org/wiki/History_of_the_Brooklyn_Dodgers',
      'excerpt': 'The Brooklyn Dodgers were an American baseball team that was active in the major leagues from 1884 until 1957, after which it moved to Los Angeles, where it continued its history as the Los Angeles Dodgers. The team&rsquo;s name derived from the reputed skill of Brooklyn residents at evading the city&rsquo;s trolley streetcar network. The Dodgers played in two stadiums in South Brooklyn, each named Washington Park, and at Eastern Park in the neighborhood of Brownsville before moving to Ebbets Field in the neighborhood of Flatbush in 1913. The team is noted for signing Jackie Robinson in 1947 as the first black player in the modern major leagues.',
      'image': 'brooklyns_got_a_winning_team.png'
    },
    {
      't': '01:35:95',
      'value': 'Davy Crockett',
      'url': 'https://en.wikipedia.org/wiki/Davy_Crockett_(nuclear_device)',
      'excerpt': 'The M-28 or M-29 Davy Crockett Weapon System was the tactical nuclear recoilless gun (smoothbore) for firing the M-388 nuclear projectile that was deployed by the United States during the Cold War. It was one of the smallest nuclear weapon systems ever built, with a yield between 10 and 20 tons TNT equivalent (40-80 Gigajoules). It is named after American soldier, congressman, and American folk hero Davy Crockett.',
      'image': 'davy_crockett.jpg'
    },
    {
      't': '01:36:56',
      'value': 'Peter Pan',
      'url': 'https://en.wikipedia.org/wiki/Peter_Pan_(1954_musical)',
      'excerpt': 'Peter Pan is a musical based on J. M. Barrie&rsquo;s 1904 play Peter Pan and Barrie&rsquo;s own novelization of it, Peter and Wendy. The music is mostly by Mark "Moose" Charlap, with additional music by Jule Styne, and most of the lyrics were written by Carolyn Leigh, with additional lyrics by Betty Comden and Adolph Green. The original 1954 Broadway production, starring Mary Martin as Peter and Cyril Ritchard as Captain Hook, earned Tony Awards for both stars. It was followed by NBC telecasts of it in 1955, 1956, and 1960 with the same stars, plus several rebroadcasts of the 1960 telecast.',
      'image': 'peter_pan.jpg'
    },
    {
      't': '01:37:42',
      'value': 'Elvis Presley',
      'url': 'https://en.wikipedia.org/wiki/Elvis_Presley',
      'excerpt': 'Elvis Aaron Presley (January 8, 1935 - August 16, 1977) was an American singer-songwriter and actor. Regarded as one of the most significant cultural icons of the 20th century, he is often referred to as the "King of Rock and Roll" or simply "the King".',
      'image': 'elvis_presley.jpg'
    },
    {
      't': '01:38:24',
      'value': 'Disneyland',
      'url': 'https://en.wikipedia.org/wiki/Disneyland',
      'excerpt': 'Disneyland Park, originally Disneyland, is the first of two theme parks built at the Disneyland Resort in Anaheim, California, opened on July 17, 1955. It is the only theme park designed and built under the direct supervision of Walt Disney. It was originally the only attraction on the property; its name was changed to Disneyland Park to distinguish it from the expanding complex in the 1990s. Walt Disney came up with the concept of Disneyland after visiting various amusement parks with his daughters in the 1930s and 1940s. He initially envisioned building a tourist attraction adjacent to his studios in Burbank to entertain fans who wished to visit; however, he soon realized that the proposed site was too small. After hiring a consultant to help him determine an appropriate site for his project, Disney bought a 160-acre (65 ha) site near Anaheim in 1953. Construction began in 1954 and the park was unveiled during a special televised press event on the ABC Television Network on July 17, 1955.',
      'image': 'disneyland.jpg'
    },
    {
      't': '01:39:50',
      'value': 'Bardot',
      'url': 'https://en.wikipedia.org/wiki/Brigitte_Bardot',
      'excerpt': 'Brigitte Anne-Marie Bardot (born 28 September 1934) is a French actress, singer and fashion model, who later became an animal rights activist. She was one of the best known sex symbols of the 1950s and 1960s and was widely referred to by her initials, B.B.',
      'image': 'bardot.jpg'
    },
    {
      't': '01:39:90',
      'value': 'Budapest',
      'url': 'https://en.wikipedia.org/wiki/Hungarian_Revolution_of_1956',
      'excerpt': 'The Hungarian Revolution of 1956 or the Hungarian Uprising of 1956 was a nationwide revolt against the government of the Hungarian People&rsquo;s Republic and its Soviet-imposed policies, lasting from 23 October until 10 November 1956. Though leaderless when it first began, it was the first major threat to Soviet control since the USSR&rsquo;s forces drove Nazi Germany from its territory at the end of World War II. The revolt began as a student demonstration, which attracted thousands as they marched through central Budapest to the Parliament building, calling out on the streets using a van with loudspeakers. A student delegation, entering the radio building to try to broadcast the students&rsquo; demands, was detained. When the delegation&rsquo;s release was demanded by the demonstrators outside, they were fired upon by the State Security Police from within the building. One student died and was wrapped in a flag and held above the crowd. This was the start of the revolution. As the news spread, disorder and violence erupted throughout the capital.',
      'image': 'budapest.jpg'
    },
    {
      't': '01:40:95',
      'value': 'Alabama',
      'url': 'https://en.wikipedia.org/wiki/Rosa_Parks',
      'excerpt': 'Rosa Louise McCauley Parks (February 4, 1913 - October 24, 2005) was an activist in the Civil Rights Movement, whom the United States Congress called "the first lady of civil rights" and "the mother of the freedom movement". On December 1, 1955, in Montgomery, Alabama, Parks refused to obey bus driver James F. Blake&rsquo;s order to give up her seat in the colored section to a white passenger, after the white section was filled. Parks was not the first person to resist bus segregation. Others had taken similar steps, including Bayard Rustin in 1942, Irene Morgan in 1946, Lillie Mae Bradford in 1951, Sarah Louise Keys in 1952, and the members of the ultimately successful Browder v. Gayle 1956 lawsuit (Claudette Colvin, Aurelia Browder, Susie McDonald, and Mary Louise Smith) who were arrested in Montgomery for not giving up their bus seats months before Parks. NAACP organizers believed that Parks was the best candidate for seeing through a court challenge after her arrest for civil disobedience in violating Alabama segregation laws, although eventually her case became bogged down in the state courts while the Browder v. Gayle case succeeded.',
      'image': 'alabama.jpg'
    },
    {
      't': '01:41:85',
      'value': 'Khrushchev',
      'url': 'https://en.wikipedia.org/wiki/Nikita_Khrushchev',
      'excerpt': 'Nikita Sergeyevich Khrushchev(15 April 1894 - 11 September 1971) was a politician who led the Soviet Union during part of the Cold War. He served as First Secretary of the Communist Party of the Soviet Union from 1953 to 1964, and as Chairman of the Council of Ministers, or Premier, from 1958 to 1964. Khrushchev was responsible for the de-Stalinization of the Soviet Union, for backing the progress of the early Soviet space program, and for several relatively liberal reforms in areas of domestic policy. Khrushchev&rsquo;s party colleagues removed him from power in 1964, replacing him with Leonid Brezhnev as First Secretary and Alexei Kosygin as Premier.',
      'image': 'krushchev.jpg'
    },
    {
      't': '01:42:32',
      'value': 'Princess Grace',
      'url': 'https://en.wikipedia.org/wiki/Grace_Kelly',
      'excerpt': 'Grace Patricia Kelly (November 12, 1929 - September 14, 1982) was an American actress who became Princess of Monaco after marrying Prince Rainier III, in April 1956. After embarking on an acting career in 1950, at age 20, Kelly appeared in New York City theatrical productions and more than 40 episodes of live drama productions broadcast during the early 1950s Golden Age of Television. In October 1953, she gained stardom from her performance in the film Mogambo, which won her a Golden Globe Award and an Academy Award nomination in 1954. Subsequently, she had leading roles in five films, including The Country Girl (1954), for which her deglamorized performance earned her an Academy Award for Best Actress. Other films include High Noon (1952) with Gary Cooper, Dial M for Murder (1954) with Ray Milland, Rear Window (1954) with James Stewart, To Catch a Thief (1955) with Cary Grant, and High Society (1956) with Frank Sinatra and Bing Crosby. Kelly retired from acting at the age of 26 to marry Rainier and began her duties as Princess of Monaco. They had three children: Caroline, Albert II, and Stéphanie. Kelly retained her American roots, maintaining dual U.S. and Monégasque citizenship. She died on September 14, 1982, a day after suffering a stroke while driving her car, which caused a crash.',
      'image': 'princess_grace.jpg'
    },
    {
      't': '01:43:25',
      'value': 'Peyton Place',
      'url': 'https://en.wikipedia.org/wiki/Peyton_Place_(novel)',
      'excerpt': 'Peyton Place is a 1956 novel by Grace Metalious. The novel describes how three women are forced to come to terms with their identity, both as women and as sexual beings, in a small, conservative, gossipy New England town, with recurring themes of hypocrisy, social inequities and class privilege in a tale that includes incest, abortion, adultery, lust and murder. It sold 60,000 copies within the first ten days of its release and remained on the New York Times best seller list for 59 weeks.',
      'image': 'peyton_place.jpg'
    },
    {
      't': '01:44:39',
      'value': 'Trouble in the Suez',
      'url': 'https://en.wikipedia.org/wiki/Suez_Crisis',
      'excerpt': 'The Suez Crisis, also named the Tripartite Aggression (in the Arab world) and Operation Kadesh or Sinai War (in Israel), was an invasion of Egypt in late 1956 by Israel, followed by the United Kingdom and France. The aims were to regain Western control of the Suez Canal and to remove Egyptian President Gamal Abdel Nasser from power. After the fighting had started, political pressure from the United States, the Soviet Union, and the United Nations led to a withdrawal by the three invaders. The episode humiliated Great Britain and France and strengthened Nasser.',
      'image': 'trouble_in_the_suez.jpg'
    },
    {
      't': '01:59:11',
      'value': 'Little Rock',
      'url': 'https://en.wikipedia.org/wiki/Little_Rock_Nine',
      'excerpt': 'The Little Rock Nine was a group of nine African American students enrolled in Little Rock Central High School in 1957. Their enrollment was followed by the Little Rock Crisis, in which the students were initially prevented from entering the racially segregated school by Orval Faubus, the Governor of Arkansas. They then attended after the intervention of President Dwight D. Eisenhower. The U.S. Supreme Court issued its historic Brown v. Board of Education of Topeka, Kansas, 347 U.S. 483, on May 17, 1954. Tied to the 14th Amendment, the decision declared all laws establishing segregated schools to be unconstitutional, and it called for the desegregation of all schools throughout the nation. After the decision, the National Association for the Advancement of Colored People (NAACP) attempted to register black students in previously all-white schools in cities throughout the South. In Little Rock, the capital city of Arkansas, the Little Rock School Board agreed to comply with the high court&rsquo;s ruling. Virgil Blossom, the Superintendent of Schools, submitted a plan of gradual integration to the school board on May 24, 1955, which the board unanimously approved. The plan would be implemented during the fall of the 1957 school year, which would begin in September 1957.',
      'image': 'little_rock.jpg'
    },
    {
      't': '02:00:25',
      'value': 'Pasternak',
      'url': 'https://en.wikipedia.org/wiki/Boris_Pasternak',
      'excerpt': 'Boris Leonidovich Pasternak (10 February 1890 - 30 May 1960) was a Soviet Russian poet, novelist, and literary translator. In his native Russian, Pasternak&rsquo;s first book of poems, My Sister, Life (1917), is one of the most influential collections ever published in the Russian language. Pasternak&rsquo;s translations of stage plays by Goethe, Schiller, Calderon and Shakespeare remain very popular with Russian audiences. Outside Russia, Pasternak is best known as the author of Doctor Zhivago (1957), a novel which takes place between the Russian Revolution of 1905 and the First World War. Doctor Zhivago was rejected for publication in the USSR. At the instigation of Giangiacomo Feltrinelli, Doctor Zhivago was smuggled to Milan and published in 1957 and distributed with the help of the CIA in the rest of Europe. Pasternak was awarded the Nobel Prize for Literature in 1958, an event which both humiliated and enraged the Communist Party of the Soviet Union, which forced him to decline the prize, though his descendants were later to accept it in his name in 1988.',
      'image': 'pasternak.jpg'
    },
    {
      't': '02:00:90',
      'value': 'Mickey Mantle',
      'url': 'https://en.wikipedia.org/wiki/Mickey_Mantle',
      'excerpt': 'Mickey Charles Mantle (October 20, 1931 - August 13, 1995), nicknamed The Commerce Comet and The Mick, was an American professional baseball player. Mantle played his entire Major League Baseball (MLB) career with the New York Yankees as a center fielder and first baseman, from 1951 through 1968. Mantle was one of the best players and sluggers, and is regarded by many as the greatest switch hitter in baseball history. Mantle was inducted into the National Baseball Hall of Fame in 1974 and was elected to the Major League Baseball All-Century Team in 1999.',
      'image': 'mickey_mantle.jpg'
    },
    {
      't': '02:01:49',
      'value': 'Kerouac',
      'url': 'https://en.wikipedia.org/wiki/Jack_Kerouac',
      'excerpt': 'Jack Kerouac (March 12, 1922 - October 21, 1969) was an American novelist and poet. He is considered a literary iconoclast and, alongside William S. Burroughs and Allen Ginsberg, a pioneer of the Beat Generation. Kerouac is recognized for his method of spontaneous prose. Thematically, his work covers topics such as Catholic spirituality, jazz, promiscuity, Buddhism, drugs, poverty, and travel. He became an underground celebrity and, with other beats, a progenitor of the hippie movement, although he remained antagonistic toward some of its politically radical elements. In 1969, aged 47, Kerouac died from internal bleeding due to long-term alcohol abuse. Since his death, Kerouac&rsquo;s literary prestige has grown, and several previously unseen works have been published. All of his books are in print today, including The Town and the City, On the Road, Doctor Sax, The Dharma Bums, Mexico City Blues, The Subterraneans, Desolation Angels, Visions of Cody, The Sea Is My Brother, and Big Sur.',
      'image': 'kerouac.png'
    },
    {
      't': '02:02:25',
      'value': 'Sputnik',
      'url': 'https://en.wikipedia.org/wiki/Sputnik_1',
      'excerpt': 'Sputnik 1 was the first artificial Earth satellite. The Soviet Union launched it into an elliptical low Earth orbit on 4 October 1957. It was a 58 cm (23 in) diameter polished metal sphere, with four external radio antennas to broadcast radio pulses. It was visible all around the Earth and its radio pulses were detectable. This surprise success precipitated the American Sputnik crisis and triggered the Space Race, a part of the larger Cold War. The launch ushered in new political, military, technological, and scientific developments',
      'image': 'sputnik.jpg'
    },
    {
      't': '02:03:11',
      'value': 'Chou En-Lai',
      'url': 'https://en.wikipedia.org/wiki/Zhou_Enlai',
      'excerpt': 'Zhou Enlai (5 March 1898 - 8 January 1976) was the first Premier of the People&rsquo;s Republic of China, serving from October 1949 until his death in January 1976. Zhou served along with Chairman Mao Zedong and was instrumental in the Communist Party&rsquo;s rise to power, and later in consolidating its control, forming foreign policy, and developing the Chinese economy. A skilled and able diplomat, Zhou served as the Chinese foreign minister from 1949 to 1958. Advocating peaceful coexistence with the West after the stalemated Korean War, he participated in the 1954 Geneva Conference and the 1955 Bandung Conference, and helped orchestrate Richard Nixon&rsquo;s 1972 visit to China. He helped devise policies regarding the bitter disputes with the U.S., Taiwan, the Soviet Union (after 1960), India and Vietnam.',
      'image': 'chou_en-lai.jpg'
    },
    {
      't': '02:03:91',
      'value': 'Bridge On The River Kwai',
      'url': 'https://en.wikipedia.org/wiki/The_Bridge_on_the_River_Kwai',
      'excerpt': 'The Bridge on the River Kwai is a 1957 British-American epic war film directed by David Lean and starring William Holden, Jack Hawkins, Alec Guinness, and Sessue Hayakawa. Based on the novel Le Pont de la Rivière Kwai (1952) by Pierre Boulle, the film is a work of fiction, but borrows the construction of the Burma Railway in 1942-1943 for its historical setting. The movie was filmed in Ceylon (now Sri Lanka). The bridge in the film was near Kitulgala.',
      'image': 'bridge_on_the_river_kwai.jpg'
    },
    {
      't': '02:06:20',
      'value': 'Lebanon',
      'url': 'https://en.wikipedia.org/wiki/1958_Lebanon_crisis',
      'excerpt': 'The 1958 Lebanon crisis was a Lebanese political crisis caused by political and religious tensions in the country that included a U.S. military intervention. The intervention lasted around three months until President Camille Chamoun, who had requested the assistance, completed his term as president of Lebanon. American and Lebanese government forces successfully occupied the port and international airport of Beirut. With the crisis over, the United States withdrew.',
      'image': 'lebanon.jpg'
    },
    {
      't': '02:06:60',
      'value': 'Charles de Gaulle',
      'url': 'https://en.wikipedia.org/wiki/Charles_de_Gaulle',
      'excerpt': 'Charles Andre Joseph Marie de Gaulle (22 November 1890 - 9 November 1970) was a French general and statesman. He was the leader of Free France (1940-44) and the head of the Provisional Government of the French Republic (1944-46). In 1958, he founded the Fifth Republic and was elected as the President of France, a position he held until his resignation in 1969. He was the dominant figure of France during the Cold War era and his memory continues to influence French politics.',
      'image': 'charles_de_gaulle.jpg'
    },
    {
      't': '02:07:20',
      'value': 'California baseball',
      'url': 'https://en.wikipedia.org/wiki/History_of_the_New_York_Giants_(baseball)',
      'excerpt': 'The San Francisco Giants existed in the New York metropolitan area from 1883-1957. Prior to the start of the 1958 season, the team moved to San Francisco, California, where it was renamed as the San Francisco Giants. During the club&rsquo;s tenure in New York, it won five of the franchise&rsquo;s eight World Series wins and 17 of its 24 National League pennants. For most of that time, the Giants played home games in the Polo Grounds in the Upper Manhattan region of New York City. The Giants had intense rivalries with their cross-town rivals, the New York Yankees and the Brooklyn Dodgers, known collectively as the Subway Series. The New York-Brooklyn rivalry soon evolved into the Los Angeles-San Francisco rivalry. Numerous inductees of the Baseball Hall of Fame played for the New York Giants, including John McGraw, Mel Ott, Bill Terry, Willie Mays, Monte Irvin, and Travis Jackson. Some of the most memorable moments in the Giants&rsquo; New York history are Willie Mays&rsquo;s famous catch in game one of the 1954 World Series, The Shot Heard &rsquo;Round the World, and the 1922 World Series, where the Giants defeated the Yankees in four games.',
      'image': 'california_baseball.png'
    },
    {
      't': '02:08:81',
      'value': 'Starkweather homicide',
      'url': 'https://en.wikipedia.org/wiki/Charles_Starkweather',
      'excerpt': 'Charles Raymond "Charlie" Starkweather (November 24, 1938 - June 25, 1959) was an American teenaged spree killer who murdered eleven people in the states of Nebraska and Wyoming in a two-month murder spree between December 1957 and January 1958. All but one of Starkweather&rsquo;s victims were killed between January 21 and January 29, 1958, the date of his arrest. During the murders committed in 1958, Starkweather was accompanied by his 14-year-old girlfriend, Caril Ann Fugate. Starkweather was executed 17 months after the events, and Fugate served 17 years in prison before her release in 1976. The Starkweather-Fugate spree has inspired several films, including The Sadist (1963), Badlands (1973), Kalifornia (1993), and Natural Born Killers (1994). Starkweather&rsquo;s electrocution in 1959 was the last execution in Nebraska until 1994.',
      'image': 'starkweather_homicides.jpg'
    },
    {
      't': '02:10:48',
      'value': 'Children of Thalidomide',
      'url': 'https://en.wikipedia.org/wiki/Thalidomide',
      'excerpt': 'Thalidomide, sold under the brand name Immunoprin, among others, is an immunomodulatory drug and the prototype of the thalidomide class of drugs. Today, thalidomide is used mainly as a treatment of certain cancers (multiple myeloma) and of a complication of leprosy. It can be readily synthesized to yield large quantities of the drug in just two steps. Thalidomide was first marketed in 1957 in West Germany under the trade-name Contergan. The German drug company Chemie Grünenthal developed and sold the drug. Primarily prescribed as a sedative or hypnotic, thalidomide also claimed to cure "anxiety, insomnia, gastritis, and tension". Afterwards, it was used against nausea and to alleviate morning sickness in pregnant women. Thalidomide became an over-the-counter drug in West Germany on October 1, 1957. Shortly after the drug was sold in West Germany, between 5,000 and 7,000 infants were born with phocomelia (malformation of the limbs). Only 40% of these children survived. Throughout the world, about 10,000 cases were reported of infants with phocomelia due to thalidomide; only 50% of the 10,000 survived. Those subjected to thalidomide while in the womb experienced limb deficiencies in a way that the long limbs either were not developed or presented themselves as stumps. Other effects included deformed eyes and hearts, deformed alimentary and urinary tracts, blindness and deafness. The negative effects of thalidomide led to the development of more structured drug regulations and control over drug use and development.',
      'image': 'children_of_thalidomide.jpg'
    },
    {
      't': '02:15:55',
      'value': 'Buddy Holly',
      'url': 'https://en.wikipedia.org/wiki/Buddy_Holly',
      'excerpt': 'Buddy Holly (born Charles Hardin Holley; September 7, 1936 - February 3, 1959) was an American musician and singer-songwriter who was a central figure of mid-1950s rock and roll. Holley was born in Lubbock, Texas, to a musical family during the Great Depression; he learned to play guitar and to sing alongside his siblings. His style was influenced by gospel music, country music, and rhythm and blues acts, and he performed in Lubbock with his friends from high school. After a show in Clear Lake, Iowa, Holly chartered an airplane to travel to his next show, in Moorhead, Minnesota. Soon after takeoff, the plane crashed, killing Holly, Ritchie Valens, The Big Bopper, and pilot Roger Peterson in a tragedy later referred to by Don McLean as "The Day the Music Died".',
      'image': 'buddy_holly.jpg'
    },
    {
      't': '02:16:31',
      'value': 'Ben Hur',
      'url': 'https://en.wikipedia.org/wiki/Ben-Hur_(1959_film)',
      'excerpt': 'Ben-Hur is a 1959 American epic historical drama film, directed by William Wyler, produced by Sam Zimbalist for Metro-Goldwyn-Mayer and starring Charlton Heston as the title character. A remake of the 1925 silent film with the same name, Ben-Hur was adapted from Lew Wallace&rsquo;s 1880 novel Ben-Hur: A Tale of the Christ. The screenplay is credited to Karl Tunberg but includes contributions from Maxwell Anderson, S. N. Behrman, Gore Vidal, and Christopher Fry. Ben-Hur had the largest budget ($15.175 million) as well as the largest sets built of any film produced at the time. Costume designer Elizabeth Haffenden oversaw a staff of 100 wardrobe fabricators to make the costumes, and a workshop employing 200 artists and workmen provided the hundreds of friezes and statues needed in the film. Filming commenced on May 18, 1958, and wrapped on January 7, 1959, with shooting lasting for 12 to 14 hours a day, six days a week. Pre-production began in Italy at Cinecitta around October 1957, and post-production took six months. Under cinematographer Robert L. Surtees, MGM executives made the decision to film the picture in a widescreen format, which Wyler strongly disliked. More than 200 camels and 2,500 horses were used in the shooting of the film, with some 10,000 extras. The sea battle was filmed using miniatures in a huge tank on the back lot at the MGM Studios in Culver City, California. The nine-minute chariot race has become one of cinema&rsquo;s most famous sequences, and the film score, composed and conducted by Miklos Rozsa, is the longest ever composed for a film and was highly influential on cinema for more than 15 years.',
      'image': 'ben_hur.jpg'
    },
    {
      't': '02:17:40',
      'value': 'Space Monkey',
      'url': 'https://en.wikipedia.org/wiki/Monkeys_and_apes_in_space',
      'excerpt': 'Before humans went into space, several other animals were launched into space, including numerous other primates, so that scientists could investigate the biological effects of space travel. The United States launched flights containing primate cargo primarily between 1948-1961 with one flight in 1969 and one in 1985. France launched two monkey-carrying flights in 1967. The Soviet Union and Russia launched monkeys between 1983 and 1996. Most primates were anesthetized before lift-off. Overall thirty-two monkeys flew in the space program; none flew more than once. Numerous back-up monkeys also went through the programs but never flew. Monkeys and apes from several species were used, including rhesus monkeys, cynomolgus monkeys, squirrel monkeys, pig-tailed macaques, and chimpanzees.',
      'image': 'space_monkey.jpg'
    },
    {
      't': '02:18:25',
      'value': 'Mafia',
      'url': 'https://en.wikipedia.org/wiki/American_Mafia',
      'excerpt': 'The American Mafia (commonly shortened to the Mafia or Mob) or Italian-American Mafia, is a highly organized Italian-American criminal society. The organization is often referred to by members as Cosa Nostra and by the government as La Cosa Nostra (LCN). The organization&rsquo;s name is derived from the original "Mafia" or Cosa nostra, the Sicilian Mafia, though the organization eventually encompassed non-Sicilian Italian-American gangsters living in the United States and, to a lesser extent, Canada. In North America, it is sometimes referred to as the Italian Mafia or Italian Mob, though these terms may also apply to the separate yet related organized crime groups in Italy.',
      'image': 'mafia.jpg'
    },
    {
      't': '02:19:20',
      'value': 'Hula Hoops',
      'url': 'https://en.wikipedia.org/wiki/Hula_hoop',
      'excerpt': 'A hula hoop is a toy hoop that is twirled around the waist, limbs or neck. The modern hula hoop was invented in 1958 by Arthur K. "Spud" Melin and Richard Knerr, but children and adults around the world have played with hoops, twirling, rolling and throwing them throughout history. Hula hoops for children generally measure approximately 71 centimetres (28 in) in diameter, and those for adults around 1.02 metres (40 in). Traditional materials for hoops include willow, rattan (a flexible and strong vine), grapevines and stiff grasses. Today, they are usually made of plastic tubing.',
      'image': 'hula_hoops.jpg'
    },
    {
      't': '02:19:65',
      'value': 'Castro',
      'url': 'https://en.wikipedia.org/wiki/Fidel_Castro',
      'excerpt': 'Fidel Alejandro Castro Ruz (August 13, 1926 - November 25, 2016) was a Cuban revolutionary and politician who governed the Republic of Cuba as Prime Minister from 1959 to 1976 and then as President from 1976 to 2008. Politically a Marxist-Leninist and Cuban nationalist, he also served as the First Secretary of the Communist Party of Cuba from 1961 until 2011. Under his administration, Cuba became a one-party socialist state; industry and business were nationalized, and state socialist reforms were implemented throughout society.',
      'image': 'castro.jpg'
    },
    {
      't': '02:20:75',
      'value': 'Edsel is a no-go',
      'url': 'https://en.wikipedia.org/wiki/Edsel',
      'excerpt': 'The Edsel was an automobile marque that was planned, developed, and manufactured by the Ford Motor Company for model years 1958-1960. With the Edsel, Ford had expected to make significant inroads into the market share of both General Motors and Chrysler and close the gap between itself and GM in the domestic American automotive market. Ford invested heavily in a yearlong teaser campaign leading consumers to believe that the Edsel was the car of the future - an expectation it failed to meet. After it was unveiled to the public, it was considered to be unattractive, overpriced, and overhyped. The Edsel never gained popularity with contemporary American car buyers and sold poorly. The Ford Motor Company lost $250 million on the Edsel&rsquo;s development, manufacturing, and marketing. The very name "Edsel" became a popular symbol for a commercial failure.',
      'image': 'edsel_is_a_no-go.jpg'
    },
    {
      't': '02:22:13',
      'value': 'U2',
      'url': 'https://en.wikipedia.org/wiki/Lockheed_U-2',
      'excerpt': 'The Lockheed U-2, nicknamed "Dragon Lady", is an American single-jet engine, ultra-high altitude reconnaissance aircraft operated by the United States Air Force (USAF) and previously flown by the Central Intelligence Agency (CIA). It provides day and night, high-altitude (70,000 feet; 21,336 m), all-weather intelligence gathering. The U-2 has also been used for electronic sensor research, satellite calibration, and communications purposes. Early versions of the U-2 were involved in several events through the Cold War, being flown over the Soviet Union, China, Vietnam, and Cuba. In 1960, Gary Powers was shot down in a CIA U-2A over the Soviet Union by a surface-to-air missile. Another U-2, piloted by Major Rudolf Anderson, Jr., was lost in a similar fashion during the Cuban Missile Crisis of 1962.',
      'image': 'u2.jpg'
    },
    {
      't': '02:22:95',
      'value': 'Syngman Rhee',
      'url': 'https://en.wikipedia.org/wiki/Syngman_Rhee',
      'excerpt': 'Syngman Rhee (April 18, 1875 - July 19, 1965) was a South Korean statesman, the first and the last Head of State of the Provisional Government of the Republic of Korea, and President of South Korea from 1948 to 1960. His three-term presidency of South Korea (August 1948 to April 1960) was strongly affected by Cold War tensions on the Korean Peninsula. Rhee was regarded as an anti-Communist and a strongman, and he led South Korea through the Korean War. His presidency ended in resignation following popular protests against a disputed election. He died in exile in Honolulu, Hawaii.',
      'image': 'syngman_rhee.jpg'
    },
    {
      't': '02:23:75',
      'value': 'Payola',
      'url': 'https://en.wikipedia.org/wiki/Payola',
      'excerpt': 'Payola, in the music industry, is the illegal practice of payment or other inducement by record companies for the broadcast of recordings on commercial radio in which the song is presented as being part of the normal day&rsquo;s broadcast. Under U.S. law, a radio station can play a specific song in exchange for money, but this must be disclosed on the air as being sponsored airtime. Alan Freed, a disc jockey and early supporter of rock and roll (and also widely credited for actually coining the term), had his career and reputation greatly harmed by a payola scandal. Dick Clark&rsquo;s early career was nearly derailed by a payola scandal, but he avoided trouble by selling his stake in a record company and cooperating with authorities.',
      'image': 'payola.jpg'
    },
    {
      't': '02:24:63',
      'value': 'Kennedy',
      'url': 'https://en.wikipedia.org/wiki/John_F._Kennedy',
      'excerpt': 'John Fitzgerald "Jack" Kennedy (May 29, 1917 - November 22, 1963), commonly referred to by his initials JFK, was an American politician who served as the 35th President of the United States from January 1961 until his assassination in November 1963. Kennedy served at the height of the Cold War, and much of his presidency focused on managing relations with the Soviet Union. He was a member of the Democratic Party who represented Massachusetts in the United States House of Representatives and the United States Senate prior to becoming president. Kennedy&rsquo;s time in office was marked by high tensions with Communist states in the Cold War. He increased the number of American military advisers in South Vietnam by a factor of 18 over President Dwight D. Eisenhower. In April 1961, he authorized a failed joint-CIA attempt to overthrow the Cuban government of Fidel Castro in the Bay of Pigs Invasion. He subsequently rejected plans by the Joint Chiefs of Staff to orchestrate false-flag attacks on American soil in order to gain public approval for a war against Cuba. In October 1962, U.S. spy planes discovered that Soviet missile bases had been deployed in Cuba; the resulting period of tensions, termed the Cuban Missile Crisis, nearly resulted in the breakout of a global thermonuclear conflict. Domestically, Kennedy presided over the establishment of the Peace Corps and supported the Civil Rights Movement, but he was largely unsuccessful in passing his New Frontier domestic policies. Kennedy continues to rank highly in historians&rsquo; polls of U.S. presidents and with the general public. His average approval rating of 70% is the highest of any president in Gallup&rsquo;s history of systematically measuring job approval.',
      'image': 'kennedy.jpg'
    },
    {
      't': '02:25:42',
      'value': 'Chubby Checker',
      'url': 'https://en.wikipedia.org/wiki/Chubby_Checker',
      'excerpt': 'Chubby Checker (born Ernest Evans; October 3, 1941) is an American singer. He is widely known for popularizing the twist dance style, with his 1960 hit cover of Hank Ballard&rsquo;s R&B hit "The Twist". In September 2008 "The Twist" topped Billboard&rsquo;s list of the most popular singles to have appeared in the Hot 100 since its debut in 1958, an honor it maintained for an August 2013 update of the list. He also popularized the Limbo Rock and its trademark limbo dance, as well as various dance styles such as the fly. Checker is the only recording artist to place five albums in the Top 12 all at once.',
      'image': 'chubby_checker.jpg'
    },
    {
      't': '02:26:28',
      'value': 'Psycho',
      'url': 'https://en.wikipedia.org/wiki/Psycho_(1960_film)',
      'excerpt': 'Psycho is a 1960 American psychological horror film directed and produced by Alfred Hitchcock, and written by Joseph Stefano, starring Anthony Perkins, Janet Leigh, John Gavin, Vera Miles and Martin Balsam, and was based on the 1959 novel of the same name by Robert Bloch. The film centers on the encounter between a secretary, Marion Crane (Leigh), who ends up at a secluded motel after stealing money from her employer, and the motel&rsquo;s disturbed owner-manager, Norman Bates (Perkins), and its aftermath. Psycho is now considered one of Hitchcock&rsquo;s best films and praised as a major work of cinematic art by international film critics and scholars. Often ranked among the greatest films of all time, it set a new level of acceptability for violence, deviant behavior and sexuality in American films, and is widely considered to be the earliest example of the slasher film genre.',
      'image': 'psycho.jpg'
    },
    {
      't': '02:27:14',
      'value': 'Belgians in the Congo',
      'url': 'https://en.wikipedia.org/wiki/Belgian_Congo',
      'excerpt': 'The Belgian Congo was a Belgian colony in Central Africa between 1908 and 1960 in what is now the Democratic Republic of the Congo (DRC). During the 1940s and 1950s, the Congo had extensive urbanisation, and the colonial administration began various development programmes aimed at making the territory into a "model colony". By the 1950s the Congo had a wage labour force twice as large as that in any other African colony. In 1960, as the result of a widespread and increasingly radical pro-independence movement, the Congo achieved independence, becoming the Republic of Congo-Leopoldville under Patrice Lumumba and Joseph Kasa-Vubu. Poor relations between factions within the Congo, the continued involvement of Belgium in Congolese affairs, and intervention by major parties of the Cold War led to a five-year-long period of war and political instability, known as the Congo Crisis, from 1960 to 1965. This ended with the seizure of power by Joseph-Desire Mobutu.',
      'image': 'belgians_in_the_congo.png'
    },
    {
      't': '02:42:12',
      'value': 'Hemingway',
      'url': 'https://en.wikipedia.org/wiki/Ernest_Hemingway',
      'excerpt': 'Ernest Miller Hemingway (July 21, 1899 -July 2, 1961) was an American novelist, short story writer, and journalist. His economical and understated style had a strong influence on 20th-century fiction, while his life of adventure and his public image influenced later generations. Hemingway produced most of his work between the mid-1920s and the mid-1950s, and won the Nobel Prize in Literature in 1954. He published seven novels, six short story collections, and two non-fiction works. Additional works, including three novels, four short story collections, and three non-fiction works, were published posthumously. Many of his works are considered classics of American literature. Shortly after the publication of The Old Man and the Sea (1952), Hemingway went on safari to Africa, where he was almost killed in two successive plane crashes that left him in pain or ill health for much of his remaining life. Hemingway maintained permanent residences in Key West, Florida, (1930s) and Cuba (1940s and 1950s), and in 1959, he bought a house in Ketchum, Idaho, where he killed himself in mid-1961.',
      'image': 'hemingway.jpg'
    },
    {
      't': '02:42:81',
      'value': 'Eichmann',
      'url': 'https://en.wikipedia.org/wiki/Adolf_Eichmann',
      'excerpt': 'Otto Adolf Eichmann (19 March 1906 - 1 June 1962) was a German Nazi SS-Obersturmbannfuhrer (lieutenant colonel) and one of the major organizers of the Holocaust. Eichmann was tasked by SS-Obergruppenfuhrer (general/lieutenant general) Reinhard Heydrich with facilitating and managing the logistics involved in the mass deportation of Jews to ghettos and extermination camps in German-occupied Eastern Europe during World War II. In 1960, Eichmann was captured in Argentina by the Mossad, Israel&rsquo;s intelligence service. Following a widely publicised trial in Israel, he was found guilty of war crimes and hanged in 1962.',
      'image': 'eichmann.jpg'
    },
    {
      't': '02:43:62',
      'value': 'Stranger in a Strange Land',
      'url': 'https://en.wikipedia.org/wiki/Stranger_in_a_Strange_Land',
      'excerpt': 'Stranger in a Strange Land is a 1961 science fiction novel by American author Robert A. Heinlein. It tells the story of Valentine Michael Smith, a human who comes to Earth in early adulthood after being born on the planet Mars and raised by Martians. The novel explores his interaction with - and eventual transformation of - terrestrial culture. In 2012, the US Library of Congress named it one of 88 "Books that Shaped America".',
      'image': 'stranger_in_a_strange_land.jpg'
    },
    {
      't': '02:45:30',
      'value': 'Dylan',
      'url': 'https://en.wikipedia.org/wiki/Bob_dylan',
      'excerpt': 'Bob Dylan (born Robert Allen Zimmerman, May 24, 1941) is an American poetic songwriter, singer, painter, writer, and Nobel prize laureate. He has been influential in popular music and culture for more than five decades. Much of his most celebrated work dates from the 1960s, when his songs chronicled social unrest. Early songs such as "Blowin&rsquo; in the Wind" and "The Times They Are a-Changin&rsquo;" became anthems for the Civil Rights Movement and anti-war movement. Leaving behind his initial base in the American folk music revival, his six-minute single "Like a Rolling Stone", recorded in 1965, enlarged the range of popular music.',
      'image': 'dylan.jpg'
    },
    {
      't': '02:46:15',
      'value': 'Berlin',
      'url': 'https://en.wikipedia.org/wiki/Berlin_Wall',
      'excerpt': 'The Berlin Wall was a guarded concrete barrier that physically and ideologically divided Berlin from 1961 to 1989. Constructed by the German Democratic Republic (GDR, East Germany), starting on 13 August 1961, the Wall completely cut off (by land) West Berlin from surrounding East Germany and from East Berlin until government officials opened it in November 1989. Its demolition officially began on 13 June 1990 and was completed in 1992. The barrier included guard towers placed along large concrete walls, which circumscribed a wide area (later known as the "death strip") that contained anti-vehicle trenches, "fakir beds" and other defenses. The Eastern Bloc claimed that the Wall was erected to protect its population from fascist elements conspiring to prevent the "will of the people" in building a socialist state in East Germany. In practice, the Wall served to prevent the massive emigration and defection that had marked East Germany and the communist Eastern Bloc during the post-World War II period.',
      'image': 'berlin.jpg'
    },
    {
      't': '02:46:95',
      'value': 'Bay of Pigs invasion',
      'url': 'https://en.wikipedia.org/wiki/Bay_of_Pigs_Invasion',
      'excerpt': 'The Bay of Pigs Invasion was a failed military invasion of Cuba undertaken by the CIA-sponsored paramilitary group Brigade 2506 on 17 April 1961. A counter-revolutionary military (made up of Cuban exiles who traveled to the United States after Castro&rsquo;s takeover), trained and funded by the United States government&rsquo;s Central Intelligence Agency (CIA), Brigade 2506 fronted the armed wing of the Democratic Revolutionary Front (DRF) and intended to overthrow the increasingly communist government of Fidel Castro. Launched from Guatemala and Nicaragua, the invading force was defeated within three days by the Cuban Revolutionary Armed Forces, under the direct command of Prime Minister Fidel Castro.',
      'image': 'bay_of_pigs_invasion.jpg'
    },
    {
      't': '02:48:73',
      'value': 'Lawrence of Arabia',
      'url': 'https://en.wikipedia.org/wiki/Lawrence_of_Arabia_(film)',
      'excerpt': 'Lawrence of Arabia is a 1962 epic historical drama film based on the life of T. E. Lawrence. It was directed by David Lean and produced by Sam Spiegel through his British company Horizon Pictures, with the screenplay by Robert Bolt and Michael Wilson. The film stars Peter O&rsquo;Toole in the title role. It is widely considered one of the greatest and most influential films in the history of cinema. The dramatic score by Maurice Jarre and the Super Panavision 70 cinematography by Freddie Young are also highly acclaimed. The film was nominated for ten Oscars at the 35th Academy Awards in 1963; it won seven in total: Best Picture, Best Director, Best Original Score, Best Cinematography (Color), Best Art Direction (Color), Best Film Editing and Best Sound Mixing. It also won the Golden Globe Award for Best Motion Picture - Drama and the BAFTA Awards for Best Film and Outstanding British Film.',
      'image': 'lawrence_of_arabia.jpg'
    },
    {
      't': '02:50:80',
      'value': 'British Beatle-mania',
      'url': 'https://en.wikipedia.org/wiki/Beatlemania',
      'excerpt': 'Beatlemania was the intense fan frenzy directed towards the English rock band the Beatles in the 1960s. The phenomenon began in 1963 and continued past the group&rsquo;s break-up in 1970, despite the band ceasing public performances in 1966. The use of the word mania to describe fandom predates the Beatles by more than 100 years. It has continued to be used to describe the popularity of musical acts, as well as popularity of public figures and trends outside the music industry.',
      'image': 'british_beatle-mania.jpg'
    },
    {
      't': '02:51:98',
      'value': 'Ole Miss',
      'url': 'https://en.wikipedia.org/wiki/Ole_Miss_riot_of_1962',
      'excerpt': 'The Ole Miss riot of 1962, or Battle of Oxford, was fought between Southern segregationist civilians and federal and state forces beginning the night of September 30, 1962; segregationists were protesting the enrollment of James Meredith, a black US military veteran, at the University of Mississippi (known affectionately as Ole Miss) at Oxford, Mississippi. Two civilians were killed during the night, including a French journalist, and over 300 people were injured, including one third of the US Marshals deployed.',
      'image': 'ole_miss.jpg'
    },
    {
      't': '02:52:77',
      'value': 'John Glenn',
      'url': 'https://en.wikipedia.org/wiki/John_Glenn',
      'excerpt': 'John Herschel Glenn Jr. (July 18, 1921 - December 8, 2016) was a United States Marine Corps aviator, engineer, astronaut, and United States Senator from Ohio. In 1962 he was the first American to orbit the Earth, circling it three times. Before joining NASA, Glenn was a distinguished fighter pilot in World War II and Korea with six Distinguished Flying Crosses and eighteen clusters on his Air Medal. He was one of the Mercury Seven, military test pilots selected in 1959 by NASA as the United States&rsquo; first astronauts. On February 20, 1962, Glenn flew the Friendship 7 mission; the first American to orbit the Earth, he was the fifth person in space. He received the NASA Distinguished Service Medal, the Congressional Space Medal of Honor in 1978, was inducted into the U.S. Astronaut Hall of Fame in 1990, and was the last surviving member of the Mercury Seven.',
      'image': 'john_glenn.jpg'
    },
    {
      't': '02:53:58',
      'value': 'Liston beats Patterson',
      'url': 'https://en.wikipedia.org/wiki/Sonny_Liston#Liston_vs._Patterson',
      'excerpt': 'Charles L. "Sonny" Liston (unknown - December 30, 1970) was an American professional boxer who competed from 1953 to 1970. A dominant contender of his era, he became world heavyweight champion in 1962 after knocking out Floyd Patterson in the first round, repeating the knockout the following year in defense of the title; in the latter fight he also became the inaugural WBC heavyweight champion. Liston was particularly known for his toughness, formidable punching power, and intimidating appearance.',
      'image': 'liston_beats_patterson.jpg'
    },
    {
      't': '02:55:80',
      'value': 'Pope Paul',
      'url': 'https://en.wikipedia.org/wiki/Pope_Paul_VI',
      'excerpt': 'Pope Paul VI (born Giovanni Battista Enrico Antonio Maria Montini, 26 September 1897 - 6 August 1978), reigned as Pope from 21 June 1963 to his death in 1978. Succeeding Pope John XXIII, he continued the Second Vatican Council which he closed in 1965, implementing its numerous reforms, and fostered improved ecumenical relations with Eastern Orthodox and Protestants, which resulted in many historic meetings and agreements. Montini served in the Vatican&rsquo;s Secretariat of State from 1922 to 1954. While in the Secretariat of State, Montini and Domenico Tardini were considered as the closest and most influential colleagues of Pope Pius XII, who in 1954 named him Archbishop of Milan, the largest Italian diocese. Montini later became the Secretary of the Italian Bishops Conference. John XXIII elevated him to the College of Cardinals in 1958, and after the death of John XXIII, Montini was considered one of his most likely successors',
      'image': 'pope_paul.jpg'
    },
    {
      't': '02:56:65',
      'value': 'Malcolm X',
      'url': 'https://en.wikipedia.org/wiki/Malcolm_X',
      'excerpt': 'Malcolm X (May 19, 1925 - February 21, 1965), born Malcolm Little and later also known as el-Hajj Malik el-Shabazz, was an African-American Muslim minister and human rights activist. To his admirers he was a courageous advocate for the rights of blacks, a man who indicted white America in the harshest terms for its crimes against black Americans; detractors accused him of preaching racism and violence. He has been called one of the greatest and most influential African Americans in history. By March 1964, Malcolm X had grown disillusioned with the Nation of Islam and its leader Elijah Muhammad. Expressing many regrets about his time with them, which he had come to regard as largely wasted, he embraced Sunni Islam. After a period of travel in Africa and the Middle East, which included completing the Hajj, he repudiated the Nation of Islam, disavowed racism and founded Muslim Mosque, Inc. and the Organization of Afro-American Unity. He continued to emphasize Pan-Africanism, black self-determination, and black self-defense. In February 1965, he was assassinated by three members of the Nation of Islam.',
      'image': 'malcolm_x.jpg'
    },
    {
      't': '02:57:50',
      'value': 'British Politician sex',
      'url': 'https://en.wikipedia.org/wiki/Profumo_affair',
      'excerpt': 'The Profumo affair was a British political scandal that originated with a brief sexual relationship in 1961 between John Profumo, the Secretary of State for War in Harold Macmillan&rsquo;s government, and Christine Keeler, a 19-year-old would-be model. In March 1963, Profumo denied any impropriety in a personal statement[n 1] to the House of Commons, but was forced to admit the truth a few weeks later. He resigned from the government and from Parliament. The repercussions of the affair severely damaged Macmillan&rsquo;s self-confidence, and he resigned as prime minister on health grounds in October 1963. His Conservative Party was marked by the scandal, which may have contributed to its defeat by Labour in the 1964 general election.',
      'image': 'british_politician_sex.jpg'
    },
    {
      't': '02:58:57',
      'value': 'J.F.K. blown away',
      'url': 'https://en.wikipedia.org/wiki/Assassination_of_John_F._Kennedy',
      'excerpt': 'John F. Kennedy, the 35th President of the United States, was assassinated on Friday, November 22, 1963 at 12:30 p.m Central Standard Time in Dallas, Texas while riding in a motorcade in Dealey Plaza. Kennedy was fatally shot by Lee Harvey Oswald while he was riding with his wife, Jacqueline, Texas Governor John Connally, and Connally&rsquo;s wife, Nellie, in a presidential motorcade. A ten-month investigation by the Warren Commission from November 1963 to September 1964 concluded that Oswald acted alone in shooting Kennedy, and that Jack Ruby also acted alone when he killed Oswald before he could stand trial. Kennedy&rsquo;s death marked the fourth (following Lincoln, Garfield, and McKinley) and most recent assassination of an American President. Vice President Lyndon B. Johnson became President upon Kennedy&rsquo;s death.',
      'image': 'jfk_blown_away.png'
    },
    {
      't': '03:15:28',
      'value': 'Birth control',
      'url': 'https://en.wikipedia.org/wiki/Birth_control',
      'excerpt': 'Birth control, also known as contraception and fertility control, is a method or device used to prevent pregnancy. Birth control has been used since ancient times, but effective and safe methods of birth control only became available in the 20th century. Planning, making available, and using birth control is called family planning. Some cultures limit or discourage access to birth control because they consider it to be morally, religiously, or politically undesirable.',
      'image': 'birth_control.jpg'
    },
    {
      't': '03:16:10',
      'value': 'Ho Chi Minh',
      'url': 'https://en.wikipedia.org/wiki/Ho_Chi_Minh',
      'excerpt': 'Ho Chi Minh (19 May 1890 - 2 September 1969), born Nguyen Sinh Cung, was a Vietnamese Communist revolutionary leader who was Chairman and First secretary of the Workers&rsquo; Party of Vietnam. Ho was also prime minister (1945-55) and president (1945-69) of the Democratic Republic of Vietnam (North Vietnam). He was a key figure in the foundation of the Democratic Republic of Vietnam in 1945, as well as the People&rsquo;s Army of Vietnam (PAVN) and the Viet Cong (NLF or VC) during the Vietnam War. He led the Viet Minh independence movement from 1941 onward, establishing the Communist-ruled Democratic Republic of Vietnam in 1945 and defeating the French Union in 1954 at the battle of Dien Bien Phu. He officially stepped down from power in 1965 due to health problems, but remained a highly respected inspiration for those Vietnamese fighting for his cause - a united, communist Vietnam - until his death. After the war, Saigon, the former capital of the Republic of Vietnam, was renamed Ho Chi Minh City.',
      'image': 'ho_chi_minh.jpg'
    },
    {
      't': '03:16:73',
      'value': 'Richard Nixon back again',
      'url': 'https://en.wikipedia.org/wiki/Presidency_of_Richard_Nixon',
      'excerpt': 'The presidency of Richard Nixon began on January 20, 1969, when he was inaugurated, and ended on August 9, 1974, when he resigned in the face of almost certain impeachment and removal from office, the first U.S. president ever to do so. He was succeeded by Vice President Gerald Ford, who had become vice president nine months earlier, following Spiro Agnew&rsquo;s resignation from office. A Republican, Nixon took office after the 1968 presidential election, in which he defeated Hubert Humphrey, the then–incumbent Vice President. Four years later, in 1972, Nixon won reelection in a landslide victory over George McGovern.',
      'image': 'richard_nixon_back_again.jpg'
    },
    {
      't': '03:18:44',
      'value': 'Moonshot',
      'url': 'https://en.wikipedia.org/wiki/Apollo_11',
      'excerpt': 'Apollo 11 was the spaceflight that landed the first two humans on the Moon. Mission commander Neil Armstrong and pilot Buzz Aldrin, both American, landed the lunar module Eagle on July 20, 1969, at 20:18 UTC. Armstrong became the first to step onto the lunar surface six hours later on July 21 at 02:56:15 UTC; Aldrin joined him about 20 minutes later. They spent about two and a quarter hours together outside the spacecraft, and collected 47.5 pounds (21.5 kg) of lunar material to bring back to Earth. Michael Collins piloted the command module Columbia alone in lunar orbit while they were on the Moon&rsquo;s surface. Armstrong and Aldrin spent just under a day on the lunar surface before rendezvousing with Columbia in lunar orbit.',
      'image': 'moonshot.jpg'
    },
    {
      't': '03:19:22',
      'value': 'Woodstock',
      'url': 'https://en.wikipedia.org/wiki/Woodstock',
      'excerpt': 'The Woodstock Music & Art Fair - informally, the Woodstock Festival or simply Woodstock - was a music festival attracting an audience of over 400,000 people, scheduled over three days on a dairy farm in New York from August 15 to 17, 1969, but ultimately ran four days long, ending August 18, 1969.',
      'image': 'woodstock.jpg'
    },
    {
      't': '03:20:11',
      'value': 'Watergate',
      'url': 'https://en.wikipedia.org/wiki/Watergate_scandal',
      'excerpt': 'Watergate was a major political scandal that occurred in the United States in the 1970s, following a break-in at the Democratic National Committee (DNC) headquarters at the Watergate office complex in Washington, D.C. on June 17, 1972 and President Richard Nixon&rsquo;s administration&rsquo;s attempted cover-up of its involvement. When the conspiracy was discovered and investigated by the U.S. Congress, the Nixon administration&rsquo;s resistance to its probes led to a constitutional crisis.',
      'image': 'watergate.JPG'
    },
    {
      't': '03:20:92',
      'value': 'Punk Rock',
      'url': 'https://en.wikipedia.org/wiki/Punk_rock',
      'excerpt': 'Punk rock (or simply "punk") is a rock music genre that developed in the early to mid-1970s in the United States, United Kingdom, and Australia. Rooted in 1960s garage rock and other forms of what is now known as "proto-punk" music, punk rock bands rejected perceived excesses of mainstream 1970s rock. Punk bands typically produced short or fast-paced songs, with hard-edged melodies and singing styles, stripped-down instrumentation, and often political, anti-establishment lyrics. Punk embraces a DIY ethic; many bands self-produce recordings and distribute them through informal channels.',
      'image': 'punk_rock.jpg'
    },
    {
      't': '03:21:73',
      'value': 'Begin',
      'url': 'https://en.wikipedia.org/wiki/Menachem_Begin',
      'excerpt': 'Menachem Begin (16 August 1913 - 9 March 1992) was an Israeli politician, founder of Likud and the sixth Prime Minister of Israel. Before the creation of the state of Israel, he was the leader of the Zionist militant group Irgun, the Revisionist breakaway from the larger Jewish paramilitary organization Haganah. Begin&rsquo;s most significant achievement as Prime Minister was the signing of a peace treaty with Egypt in 1979, for which he and Anwar Sadat shared the Nobel Prize for Peace.',
      'image': 'begin.JPG'
    },
    {
      't': '03:22:24',
      'value': 'Reagan',
      'url': 'https://en.wikipedia.org/wiki/Ronald_Reagan',
      'excerpt': 'Ronald Wilson Reagan (February 6, 1911 - June 5, 2004) was an American politician and actor who served as the 40th President of the United States from 1981 to 1989. Before his presidency, he was the 33rd Governor of California, from 1967 to 1975, after a career as a Hollywood actor and union leader. Leaving office in 1989, Reagan held an approval rating of sixty-eight percent, matching those of Franklin D. Roosevelt, and later Bill Clinton, as the highest ratings for departing presidents in the modern era. He was the first president since Dwight D. Eisenhower to serve two full terms, after a succession of five prior presidents failed to do so. Although he had planned an active post-presidency, in 1994 Reagan disclosed his diagnosis with Alzheimer&rsquo;s disease earlier that year, appearing publicly for the last time at the funeral of Richard Nixon. He died ten years later in 2004 at the age of 93. Reagan had the second-longest life out of all the presidents; the current longest lifespan of a president is held by Gerald Ford, who died two years after Reagan. An icon among Republicans, he is viewed favorably in historian rankings of U.S. presidents, and his tenure constituted a realignment toward conservative policies in the U.S.',
      'image': 'reagan.jpg'
    },
    {
      't': '03:22:80',
      'value': 'Palestine',
      'url': 'https://en.wikipedia.org/wiki/Palestine_(region)',
      'excerpt': 'In the course of the Six-Day War in June 1967, Israel captured the rest of Mandate Palestine from Jordan and Egypt, and began a policy of establishing Jewish settlements in those territories. From 1987 to 1993, the First Palestinian Intifada against Israel took place, which included the Declaration of the State of Palestine in 1988 and ended with the 1993 Oslo Peace Accords and the creation of the Palestinian National Authority.',
      'image': 'palestine.jpg'
    },
    {
      't': '03:23:52',
      'value': 'Terror on the airline',
      'url': 'https://en.wikipedia.org/wiki/Aircraft_hijacking',
      'excerpt': 'The so-called "Golden Age" of skyjacking in the United States ran from 1968 through 1979, and into the 1980s in parts of the world, with attacks tapering off after as new regulations made boarding aircraft with weapons extremely difficult.',
      'image': 'terror_on_the_airline.jpg'
    },
    {
      't': '03:25:53',
      'value': 'Ayatollah&rsquo;s in Iran',
      'url': 'https://en.wikipedia.org/wiki/Ruhollah_Khomeini',
      'excerpt': 'Sayyid Ruhollah Musavi Khomeini (24 September 1902 - 3 June 1989), known in the Western world as Ayatollah Khomeini, was an Iranian Shia Muslim religious leader, philosopher revolutionary, and politician. He was the founder of the Islamic Republic of Iran and the leader of the 1979 Iranian Revolution that saw the overthrow of the Pahlavi monarchy and Mohammad Reza Pahlavi, the last Shah of Iran. Following the revolution, Khomeini became the country&rsquo;s Supreme Leader, a position created in the constitution of the Islamic Republic as the highest-ranking political and religious authority of the nation, which he held until his death. He was succeeded by Ali Khamenei on 4 June 1989.',
      'image': 'ruhollah_khomeini.jpg'
    },
    {
      't': '03:26:69',
      'value': 'Russians in Afghanistan',
      'url': 'https://en.wikipedia.org/wiki/Soviet%E2%80%93Afghan_War',
      'excerpt': 'The Soviet-Afghan War lasted over nine years, from December 1979 to February 1989. Insurgent groups known as the mujahideen fought against the Soviet Army and the Democratic Republic of Afghanistan. Between 562,000-2 million civilians were killed and millions of Afghans fled the country as refugees, mostly to Pakistan and Iran. The war is considered part of the Cold War.',
      'image': 'russians_in_afghanistan.jpg'
    },
    {
      't': '03:28:43',
      'value': 'Wheel of Fortune',
      'url': 'https://en.wikipedia.org/wiki/Wheel_of_Fortune_(U.S._game_show)',
      'excerpt': 'Wheel of Fortune is an American television game show created by Merv Griffin. The show features a competition in which contestants solve word puzzles, similar to those used in Hangman, to win cash and prizes determined by spinning a giant carnival wheel. Wheel of Fortune ranks as the longest-running syndicated game show in the United States.',
      'image': 'wheel_of_fortune.png'
    },
    {
      't': '03:29:50',
      'value': 'Sally Ride',
      'url': 'https://en.wikipedia.org/wiki/Sally_Ride',
      'excerpt': 'Sally Kristen Ride (May 26, 1951 - July 23, 2012) was an American physicist and astronaut. Born in Los Angeles, she joined NASA in 1978 and became the first American woman in space in 1983. Ride was the third woman in space overall, after USSR cosmonauts Valentina Tereshkova (1963) and Svetlana Savitskaya (1982). Ride remains the youngest American astronaut to have traveled to space, having done so at the age of 32. After flying twice on the Orbiter Challenger, she left NASA in 1987. She worked for two years at Stanford University&rsquo;s Center for International Security and Arms Control, then at the University of California, San Diego as a professor of physics, primarily researching nonlinear optics and Thomson scattering. She served on the committees that investigated the Challenger and Columbia space shuttle disasters, the only person to participate in both. Ride died of pancreatic cancer on July 23, 2012.',
      'image': 'sally_ride.jpg'
    },
    {
      't': '03:29:96',
      'value': 'Heavy Metal Suicide',
      'url': 'https://en.wikipedia.org/wiki/Heavy_metal_music',
      'excerpt': 'Heavy metal is a genre of rock music that developed in the late 1960s and early 1970s, largely in the United Kingdom and the United States. With roots in blues rock and psychedelic/acid rock, the bands that created heavy metal developed a thick, massive sound, characterized by highly amplified distortion, extended guitar solos, emphatic beats, and overall loudness. Heavy metal lyrics and performance styles are sometimes associated with aggression and machismo. In 1968, the first heavy metal bands such as Led Zeppelin, Black Sabbath and Deep Purple attracted large audiences, though they were often derided by critics. During the mid-1970s, Judas Priest helped spur the genre&rsquo;s evolution by discarding much of its blues influence; Motorhead introduced a punk rock sensibility and an increasing emphasis on speed. Beginning in the late 1970s, bands in the new wave of British heavy metal such as Iron Maiden and Saxon followed in a similar vein. Before the end of the decade, heavy metal fans became known as "metalheads" or "headbangers". Although the general public has held a stereotype of heavy metal fans being suicidal, depressed and a danger to themselves and society in general. However, Adrian North, a Heriot-Watt University professor who studies genre listeners found that metal listeners were above all else creative, at ease with themselves and introverted — qualities he also found in classical music listeners.',
      'image': 'heavy_metal.jpg'
    },
    {
      't': '03:31:62',
      'value': 'Foreign Debts',
      'url': 'https://en.wikipedia.org/wiki/National_debt_of_the_United_States',
      'excerpt': 'The United States public debt as a percentage of GDP reached its highest level during Harry Truman&rsquo;s first presidential term, during and after World War II. Public debt as a percentage of GDP fell rapidly in the post-World War II period, and reached a low in 1974 under Richard Nixon. Debt as a share of GDP has consistently increased since then, except under Jimmy Carter and Bill Clinton. Public debt rose during the 1980s, as Ronald Reagan cut tax rates and increased military spending. It fell during the 1990s, due to decreased military spending, increased taxes and the 1990s boom. Public debt rose sharply in the wake of the 2007–08 financial crisis and the resulting significant tax revenue declines and spending increases.',
      'image': 'foreign_debt.jpg'
    },
    {
      't': '03:32:44',
      'value': 'Homeless Vets',
      'url': 'https://en.wikipedia.org/wiki/Vietnam_veteran',
      'excerpt': 'More than 58,000 U.S. military personnel died as a result of the Vietnam conflict. This comprises deaths from all categories including deaths while missing, captured, non-hostile deaths, homicides, and suicides. The U.S. Department of Veterans Affairs recognizes veterans that served in the country then known as the Republic of Vietnam from February 28, 1961 to May 7, 1975, as being eligible for such programs as the department&rsquo;s Readjustment Counseling Services program, also known as the Vet Centers. The Vietnam War was the last American war with conscription.',
      'image': 'homeless_vets.jpg'
    },
    {
      't': '03:33:75',
      'value': 'AIDS',
      'url': 'https://en.wikipedia.org/wiki/HIV/AIDS',
      'excerpt': 'AIDS was first clinically observed in 1981 in the United States.[36] The initial cases were a cluster of injecting drug users and homosexual men with no known cause of impaired immunity who showed symptoms of Pneumocystis carinii pneumonia (PCP), a rare opportunistic infection that was known to occur in people with very compromised immune systems. Soon thereafter, an unexpected number of homosexual men developed a previously rare skin cancer called Kaposi&rsquo;s sarcoma (KS). Many more cases of PCP and KS emerged, alerting U.S. Centers for Disease Control and Prevention (CDC) and a CDC task force was formed to monitor the outbreak.',
      'image': 'aids.jpg'
    },
    {
      't': '03:33:81',
      'value': 'Crack',
      'url': 'https://en.wikipedia.org/wiki/Crack_cocaine',
      'excerpt': 'Crack cocaine, also known simply as crack, is a free base form of cocaine that can be smoked. It offers a short but intense high to smokers. The Manual of Adolescent Substance Abuse Treatment calls it the most "addictive" (effective) form of cocaine. Crack cocaine is commonly used as a recreational drug. Crack first saw widespread use in primarily impoverished inner city neighborhoods in New York, Los Angeles, and Miami in late 1984 and 1985; its rapid increase in use and availability is sometimes termed as the "crack epidemic".',
      'image': 'crack.jpeg'
    },
    {
      't': '03:34:27',
      'value': 'Bernie Goetz',
      'url': 'https://en.wikipedia.org/wiki/1984_New_York_City_Subway_shooting',
      'excerpt': 'Bernhard Goetz shot four alleged muggers on a New York City Subway train in Manhattan on December 22, 1984. He fired five shots, seriously wounding all four men. Goetz surrendered to police nine days after the shooting and was eventually charged with attempted murder, assault, reckless endangerment, and several firearms offenses. A jury found him not guilty of all charges except for one count of carrying an unlicensed firearm, for which he served eight months of a one-year sentence. In 1996, one of the shot men, who had been left paraplegic and brain damaged as a result of his injuries, obtained a civil judgment of $43 million against Goetz. The incident sparked a nationwide debate on race and crime in major cities, the legal limits of self-defense, and the extent to which the citizenry could rely on the police to secure their safety. Goetz, dubbed the "Subway Vigilante" by New York City&rsquo;s press, came to symbolize New Yorkers&rsquo; frustrations with the high crime rates of the 1980s. He was both praised and vilified in the media and public opinion.',
      'image': 'bernie_goetz.jpg'
    },
    {
      't': '03:35:45',
      'value': 'Hypodermics on the shores',
      'url': 'https://en.wikipedia.org/wiki/Syringe_Tide',
      'excerpt': 'The Syringe Tide was an environmental disaster during 1987-88 in Connecticut, New Jersey and New York where significant amounts of medical waste, including hypodermic syringes, and raw garbage washed up onto beaches on the Jersey Shore, in New York City, and on Long Island. This forced the closing of beaches on the Atlantic coast. Officials scrambled to identify the source of the material as some local economies struggled with diminished tourism.',
      'image': 'syringe_tide.png'
    },
    {
      't': '03:36:64',
      'value': 'China&rsquo;s under martial law',
      'url': 'https://en.wikipedia.org/wiki/Tiananmen_Square_protests_of_1989',
      'excerpt': 'The Tiananmen Square protests of 1989, commonly known in China as the June Fourth Incident, were student-led demonstrations in Beijing in 1989. More broadly, it refers to the popular national movement inspired by the Beijing protests during that period, sometimes referred to as the &rsquo;89 Democracy Movement. The protests were forcibly suppressed after the government declared martial law. In what became widely known as the Tiananmen Square Massacre, troops with assault rifles and tanks killed at least several hundred demonstrators trying to block the military&rsquo;s advance towards Tiananmen Square. The number of civilian deaths has been estimated at anywhere from hundreds to thousands',
      'image': 'tiananmen_square.jpg'
    },
    {
      't': '03:38:38',
      'value': 'Rock and Roller Cola Wars',
      'url': 'https://en.wikipedia.org/wiki/Cola_wars',
      'excerpt': 'The cola wars are a series of mutually-targeted television advertisements and marketing campaigns since the 1980s between two long-time rival soft drink producers, The Coca-Cola Company and PepsiCo. The battle between the two dominant brands in the United States intensified to such an extent that the term &ldquo;Cola wars&rdquo; was used to describe the feud. Each employed numerous advertising and marketing campaigns to outdo the other.',
      'image': 'cola_wars.jpg'
    }
  ];

  return lyrics;

};
