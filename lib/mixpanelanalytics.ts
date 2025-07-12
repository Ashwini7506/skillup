//Import Mixpanel SDK
import mixpanel from "mixpanel-browser";
 
// Near entry of your product, init Mixpanel
mixpanel.init("ec3437170d914d3490d52d21a83f0d59"
, {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
});