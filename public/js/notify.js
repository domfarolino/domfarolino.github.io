// A non-sensitive endpoint that nominally represents the device that receives a
// push notification.
const BACKEND = `https://push-notifications-server.glitch.me`;
const ENDPOINT = `
https://web.push.apple.com/QLW2A8B_w00kz77r2sIdESXTsF48tWF30HQpKr8O9aERaW7uKA3cvi6R0HC7Ow0xsMX64TGcUOas2xyhM4eJIAvWFB64fyDc-pZcan60rPJI6fcmR-nM0l3kI3HHN6ixALvRl4RMtGK7ZbhWfDXaLnKOKiit25omfY4AHwm2nTY
`;

// Probably this is a common function, but I first saw it on
// https://github.com/matteosandrin/personal-website/blob/master/public/assets/js/notify.js#L1C1-L11.
//
// Returns true if the user agent indicates it's a bot; false otherwise.
function botCheck() {
  const botPattern =
    "(bot|crawler|spider|crawling|googlebot/|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis)";
  const re = new RegExp(botPattern, "i");
  if (re.test(navigator.userAgent)) {
    return true;
  } else {
    return false;
  }
}

async function getIP() {
  return await fetch('https://api.ipify.org/?format=json')
    .then(response => response.json())
    .then(responseJson => responseJson['ip']);
}

async function getGeoData() {
  return await fetch(`${BACKEND}/getGeoData?ip=${await getIP()}`)
    .then(response => response.json());
}

async function notifyClientOfVisit() {
  // Don't do any notifying for bots.
  if (botCheck()) {
    return;
  }

  const geoData = await getGeoData();
  geoData['referrer'] = document.referrer;
  geoData['fullUrl'] = location.href;
  const geoDataAsString = JSON.stringify(geoData);
  await fetch(`${BACKEND}/pushOneForNewVisitor?endpoint=${ENDPOINT}&text=${geoDataAsString}`, {mode: 'no-cors'});
}


(async function(){
  try {
    await notifyClientOfVisit();
  } catch (e) {
    console.error('Error notifying client of visit', e);
  }
})();
