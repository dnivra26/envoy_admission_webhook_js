'use strict';
const envoyContainer = require('./envoy-container.json');
const envoyVolume = require('./envoy-volume.json');
exports.addenvoy = function addenvoy (req, res) {
  var admissionRequest = req.body;

  // Get a reference to the pod spec
  var object = admissionRequest.request.object;

  console.log("admission request---")
  console.log(JSON.stringify(admissionRequest))
  console.log(`validating the ${object.metadata.name} pod`);

  const labels = object.metadata.labels;
  var admissionResponse = {
    allowed: true,
  };

  if(labels['envoy-injection']=='enabled') {
    console.log('envoy-injection enabled. adding patch...')
    const allcontainers = object.spec.containers.concat([envoyContainer]);
    const allvolumes = object.spec.volumes.concat([envoyVolume]);

    console.log("allcontainers----");
    console.log(allcontainers);  

    console.log("allvolumes----");
    console.log(allvolumes);  
    admissionResponse.patchType = "JSONPatch"
    admissionResponse.patch = toUTF8Array(JSON.stringify([
      {
        "op":"add",
        "path":"/spec/containers",
        "value":allcontainers
      },
      {
        "op":"add",
        "path":"/spec/volumes",
        "value":allvolumes
      }
      ]))
  } else {
    console.log('envoy-injection not enabled. skipping pod...')
  }

  var admissionReview = {
    response: admissionResponse
  };

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(admissionReview));
  res.status(200).end();
};

function toUTF8Array(str) {
  var utf8 = [];
  for (var i=0; i < str.length; i++) {
      var charcode = str.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6), 
                    0x80 | (charcode & 0x3f));
      }
      else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12), 
                    0x80 | ((charcode>>6) & 0x3f), 
                    0x80 | (charcode & 0x3f));
      }
      // surrogate pair
      else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                    | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18), 
                    0x80 | ((charcode>>12) & 0x3f), 
                    0x80 | ((charcode>>6) & 0x3f), 
                    0x80 | (charcode & 0x3f));
      }
  }
  return utf8;
}
