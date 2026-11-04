// A shadow root keeps both the site's rules and our scrollbar rules out of the measurement.
const probeHost = document.createElement('div');
probeHost.style.cssText = 'all:initial!important;position:fixed!important;visibility:hidden!important;pointer-events:none!important;width:0!important;height:0!important';
const probe = document.createElement('div');
probe.style.cssText = 'width:100px;height:100px;overflow:scroll';
probeHost.attachShadow({mode: 'closed'}).append(probe);
document.documentElement.append(probeHost);
const width = probe.offsetWidth - probe.clientWidth;
const height = probe.offsetHeight - probe.clientHeight;
probeHost.remove();
// Overlay scrollbars reserve no measurable space. Give them a 24px target.
document.documentElement.style.setProperty('--wide-scrollbars-width', (width * 2 || 24) + 'px');
document.documentElement.style.setProperty('--wide-scrollbars-height', (height * 2 || 24) + 'px');
