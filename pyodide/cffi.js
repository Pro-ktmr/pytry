var Module=typeof globalThis.__pyodide_module!=="undefined"?globalThis.__pyodide_module:{};if(!Module.expectedDataFileDownloads){Module.expectedDataFileDownloads=0}Module.expectedDataFileDownloads++;(function(){var loadPackage=function(metadata){var PACKAGE_PATH="";if(typeof window==="object"){PACKAGE_PATH=window["encodeURIComponent"](window.location.pathname.toString().substring(0,window.location.pathname.toString().lastIndexOf("/"))+"/")}else if(typeof process==="undefined"&&typeof location!=="undefined"){PACKAGE_PATH=encodeURIComponent(location.pathname.toString().substring(0,location.pathname.toString().lastIndexOf("/"))+"/")}var PACKAGE_NAME="cffi.data";var REMOTE_PACKAGE_BASE="cffi.data";if(typeof Module["locateFilePackage"]==="function"&&!Module["locateFile"]){Module["locateFile"]=Module["locateFilePackage"];err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")}var REMOTE_PACKAGE_NAME=Module["locateFile"]?Module["locateFile"](REMOTE_PACKAGE_BASE,""):REMOTE_PACKAGE_BASE;var REMOTE_PACKAGE_SIZE=metadata["remote_package_size"];var PACKAGE_UUID=metadata["package_uuid"];function fetchRemotePackage(packageName,packageSize,callback,errback){if(typeof process==="object"){require("fs").readFile(packageName,(function(err,contents){if(err){errback(err)}else{callback(contents.buffer)}}));return}var xhr=new XMLHttpRequest;xhr.open("GET",packageName,true);xhr.responseType="arraybuffer";xhr.onprogress=function(event){var url=packageName;var size=packageSize;if(event.total)size=event.total;if(event.loaded){if(!xhr.addedTotal){xhr.addedTotal=true;if(!Module.dataFileDownloads)Module.dataFileDownloads={};Module.dataFileDownloads[url]={loaded:event.loaded,total:size}}else{Module.dataFileDownloads[url].loaded=event.loaded}var total=0;var loaded=0;var num=0;for(var download in Module.dataFileDownloads){var data=Module.dataFileDownloads[download];total+=data.total;loaded+=data.loaded;num++}total=Math.ceil(total*Module.expectedDataFileDownloads/num);if(Module["setStatus"])Module["setStatus"]("Downloading data... ("+loaded+"/"+total+")")}else if(!Module.dataFileDownloads){if(Module["setStatus"])Module["setStatus"]("Downloading data...")}};xhr.onerror=function(event){throw new Error("NetworkError for: "+packageName)};xhr.onload=function(event){if(xhr.status==200||xhr.status==304||xhr.status==206||xhr.status==0&&xhr.response){var packageData=xhr.response;callback(packageData)}else{throw new Error(xhr.statusText+" : "+xhr.responseURL)}};xhr.send(null)}function handleError(error){console.error("package error:",error)}var fetchedCallback=null;var fetched=Module["getPreloadedPackage"]?Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE):null;if(!fetched)fetchRemotePackage(REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE,(function(data){if(fetchedCallback){fetchedCallback(data);fetchedCallback=null}else{fetched=data}}),handleError);function runWithFS(){function assert(check,msg){if(!check)throw msg+(new Error).stack}Module["FS_createPath"]("/","lib",true,true);Module["FS_createPath"]("/lib","python3.9",true,true);Module["FS_createPath"]("/lib/python3.9","site-packages",true,true);Module["FS_createPath"]("/lib/python3.9/site-packages","cffi",true,true);Module["FS_createPath"]("/lib/python3.9/site-packages","cffi-1.14.6-py3.9.egg-info",true,true);function processPackageData(arrayBuffer){assert(arrayBuffer,"Loading data file failed.");assert(arrayBuffer instanceof ArrayBuffer,"bad input to processPackageData");var byteArray=new Uint8Array(arrayBuffer);var curr;var compressedData={data:null,cachedOffset:291552,cachedIndexes:[-1,-1],cachedChunks:[null,null],offsets:[0,1371,2698,3882,5311,6365,7531,8680,10036,11554,12915,14365,15917,17346,18928,20340,21980,23662,25201,26858,28404,29852,31464,33065,34419,35967,37541,38855,40328,41833,43415,44651,46278,47767,49175,50776,52352,53974,55562,56948,58312,59894,61315,62898,64516,66050,67465,69033,70652,71780,73025,74356,75721,77147,78435,79901,81477,83008,84520,85884,87325,88811,90279,91093,92041,93133,93460,93485,93865,95178,96315,97612,98791,99835,101212,102340,103677,104829,106211,107343,108551,109594,110632,111610,112601,113863,115061,116053,116920,118204,119203,120150,121193,122081,123140,123922,124712,125685,126515,127541,128459,129483,130428,131449,132432,133440,134428,135458,136485,137474,138628,139751,140679,141952,143088,144477,145379,146625,147938,149161,150317,151503,152416,153556,154486,155400,156579,157551,158470,159521,160947,162060,163152,164124,165032,166029,167253,168510,169759,170937,171755,172567,173773,174858,175876,176921,177944,179061,180118,181526,182677,183823,184769,185768,186597,187797,188907,189868,191008,192092,193115,194376,195455,196492,197544,198512,199551,200542,201698,202934,203990,205211,206109,207139,208223,209381,210465,211625,212637,213648,214780,215912,216881,218212,219613,220888,222111,223437,224787,225781,227001,228105,229119,230086,231171,232183,233153,234208,235361,236352,237371,238431,239463,240578,241460,242032,242619,243727,245116,246520,247523,248629,249565,250621,251823,252999,253979,255022,256137,257052,258307,259397,260537,261696,262805,263836,265054,266493,267410,268287,268803,269464,270492,271589,272681,273539,274638,275931,277079,278459,279722,281171,282198,283563,284856,286219,287565,288889,290082,290949],sizes:[1371,1327,1184,1429,1054,1166,1149,1356,1518,1361,1450,1552,1429,1582,1412,1640,1682,1539,1657,1546,1448,1612,1601,1354,1548,1574,1314,1473,1505,1582,1236,1627,1489,1408,1601,1576,1622,1588,1386,1364,1582,1421,1583,1618,1534,1415,1568,1619,1128,1245,1331,1365,1426,1288,1466,1576,1531,1512,1364,1441,1486,1468,814,948,1092,327,25,380,1313,1137,1297,1179,1044,1377,1128,1337,1152,1382,1132,1208,1043,1038,978,991,1262,1198,992,867,1284,999,947,1043,888,1059,782,790,973,830,1026,918,1024,945,1021,983,1008,988,1030,1027,989,1154,1123,928,1273,1136,1389,902,1246,1313,1223,1156,1186,913,1140,930,914,1179,972,919,1051,1426,1113,1092,972,908,997,1224,1257,1249,1178,818,812,1206,1085,1018,1045,1023,1117,1057,1408,1151,1146,946,999,829,1200,1110,961,1140,1084,1023,1261,1079,1037,1052,968,1039,991,1156,1236,1056,1221,898,1030,1084,1158,1084,1160,1012,1011,1132,1132,969,1331,1401,1275,1223,1326,1350,994,1220,1104,1014,967,1085,1012,970,1055,1153,991,1019,1060,1032,1115,882,572,587,1108,1389,1404,1003,1106,936,1056,1202,1176,980,1043,1115,915,1255,1090,1140,1159,1109,1031,1218,1439,917,877,516,661,1028,1097,1092,858,1099,1293,1148,1380,1263,1449,1027,1365,1293,1363,1346,1324,1193,867,603],successes:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]};compressedData["data"]=byteArray;assert(typeof Module.LZ4==="object","LZ4 not present - was your app build with  -s LZ4=1  ?");Module.LZ4.loadPackage({metadata:metadata,compressedData:compressedData},true);Module["removeRunDependency"]("datafile_cffi.data")}Module["addRunDependency"]("datafile_cffi.data");if(!Module.preloadResults)Module.preloadResults={};Module.preloadResults[PACKAGE_NAME]={fromCache:false};if(fetched){processPackageData(fetched);fetched=null}else{fetchedCallback=processPackageData}}if(Module["calledRun"]){runWithFS()}else{if(!Module["preRun"])Module["preRun"]=[];Module["preRun"].push(runWithFS)}};loadPackage({files:[{filename:"/lib/python3.9/site-packages/_cffi_backend.so",start:0,end:138771,audio:0},{filename:"/lib/python3.9/site-packages/cffi/__init__.py",start:138771,end:139284,audio:0},{filename:"/lib/python3.9/site-packages/cffi/api.py",start:139284,end:181348,audio:0},{filename:"/lib/python3.9/site-packages/cffi/backend_ctypes.py",start:181348,end:223802,audio:0},{filename:"/lib/python3.9/site-packages/cffi/cffi_opcode.py",start:223802,end:229526,audio:0},{filename:"/lib/python3.9/site-packages/cffi/commontypes.py",start:229526,end:232215,audio:0},{filename:"/lib/python3.9/site-packages/cffi/cparser.py",start:232215,end:276446,audio:0},{filename:"/lib/python3.9/site-packages/cffi/error.py",start:276446,end:277323,audio:0},{filename:"/lib/python3.9/site-packages/cffi/ffiplatform.py",start:277323,end:281369,audio:0},{filename:"/lib/python3.9/site-packages/cffi/lock.py",start:281369,end:282116,audio:0},{filename:"/lib/python3.9/site-packages/cffi/model.py",start:282116,end:303884,audio:0},{filename:"/lib/python3.9/site-packages/cffi/pkgconfig.py",start:303884,end:308258,audio:0},{filename:"/lib/python3.9/site-packages/cffi/recompiler.py",start:308258,end:372826,audio:0},{filename:"/lib/python3.9/site-packages/cffi/setuptools_ext.py",start:372826,end:381757,audio:0},{filename:"/lib/python3.9/site-packages/cffi/vengine_cpy.py",start:381757,end:425077,audio:0},{filename:"/lib/python3.9/site-packages/cffi/vengine_gen.py",start:425077,end:451761,audio:0},{filename:"/lib/python3.9/site-packages/cffi/verifier.py",start:451761,end:463014,audio:0},{filename:"/lib/python3.9/site-packages/cffi/_cffi_include.h",start:463014,end:477814,audio:0},{filename:"/lib/python3.9/site-packages/cffi/parse_c_type.h",start:477814,end:483790,audio:0},{filename:"/lib/python3.9/site-packages/cffi/_embedding.h",start:483790,end:501371,audio:0},{filename:"/lib/python3.9/site-packages/cffi/_cffi_errors.h",start:501371,end:505279,audio:0},{filename:"/lib/python3.9/site-packages/cffi-1.14.6-py3.9.egg-info/PKG-INFO",start:505279,end:506467,audio:0},{filename:"/lib/python3.9/site-packages/cffi-1.14.6-py3.9.egg-info/SOURCES.txt",start:506467,end:511480,audio:0},{filename:"/lib/python3.9/site-packages/cffi-1.14.6-py3.9.egg-info/dependency_links.txt",start:511480,end:511481,audio:0},{filename:"/lib/python3.9/site-packages/cffi-1.14.6-py3.9.egg-info/entry_points.txt",start:511481,end:511557,audio:0},{filename:"/lib/python3.9/site-packages/cffi-1.14.6-py3.9.egg-info/not-zip-safe",start:511557,end:511558,audio:0},{filename:"/lib/python3.9/site-packages/cffi-1.14.6-py3.9.egg-info/requires.txt",start:511558,end:511568,audio:0},{filename:"/lib/python3.9/site-packages/cffi-1.14.6-py3.9.egg-info/top_level.txt",start:511568,end:511587,audio:0}],remote_package_size:295648,package_uuid:"f2f2d5e9-a3a4-4d3f-920e-659f0c3c8e4d"})})();