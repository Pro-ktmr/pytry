var Module=typeof globalThis.__pyodide_module!=="undefined"?globalThis.__pyodide_module:{};if(!Module.expectedDataFileDownloads){Module.expectedDataFileDownloads=0}Module.expectedDataFileDownloads++;(function(){var loadPackage=function(metadata){var PACKAGE_PATH="";if(typeof window==="object"){PACKAGE_PATH=window["encodeURIComponent"](window.location.pathname.toString().substring(0,window.location.pathname.toString().lastIndexOf("/"))+"/")}else if(typeof process==="undefined"&&typeof location!=="undefined"){PACKAGE_PATH=encodeURIComponent(location.pathname.toString().substring(0,location.pathname.toString().lastIndexOf("/"))+"/")}var PACKAGE_NAME="logbook.data";var REMOTE_PACKAGE_BASE="logbook.data";if(typeof Module["locateFilePackage"]==="function"&&!Module["locateFile"]){Module["locateFile"]=Module["locateFilePackage"];err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")}var REMOTE_PACKAGE_NAME=Module["locateFile"]?Module["locateFile"](REMOTE_PACKAGE_BASE,""):REMOTE_PACKAGE_BASE;var REMOTE_PACKAGE_SIZE=metadata["remote_package_size"];var PACKAGE_UUID=metadata["package_uuid"];function fetchRemotePackage(packageName,packageSize,callback,errback){if(typeof process==="object"){require("fs").readFile(packageName,(function(err,contents){if(err){errback(err)}else{callback(contents.buffer)}}));return}var xhr=new XMLHttpRequest;xhr.open("GET",packageName,true);xhr.responseType="arraybuffer";xhr.onprogress=function(event){var url=packageName;var size=packageSize;if(event.total)size=event.total;if(event.loaded){if(!xhr.addedTotal){xhr.addedTotal=true;if(!Module.dataFileDownloads)Module.dataFileDownloads={};Module.dataFileDownloads[url]={loaded:event.loaded,total:size}}else{Module.dataFileDownloads[url].loaded=event.loaded}var total=0;var loaded=0;var num=0;for(var download in Module.dataFileDownloads){var data=Module.dataFileDownloads[download];total+=data.total;loaded+=data.loaded;num++}total=Math.ceil(total*Module.expectedDataFileDownloads/num);if(Module["setStatus"])Module["setStatus"]("Downloading data... ("+loaded+"/"+total+")")}else if(!Module.dataFileDownloads){if(Module["setStatus"])Module["setStatus"]("Downloading data...")}};xhr.onerror=function(event){throw new Error("NetworkError for: "+packageName)};xhr.onload=function(event){if(xhr.status==200||xhr.status==304||xhr.status==206||xhr.status==0&&xhr.response){var packageData=xhr.response;callback(packageData)}else{throw new Error(xhr.statusText+" : "+xhr.responseURL)}};xhr.send(null)}function handleError(error){console.error("package error:",error)}var fetchedCallback=null;var fetched=Module["getPreloadedPackage"]?Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE):null;if(!fetched)fetchRemotePackage(REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE,(function(data){if(fetchedCallback){fetchedCallback(data);fetchedCallback=null}else{fetched=data}}),handleError);function runWithFS(){function assert(check,msg){if(!check)throw msg+(new Error).stack}Module["FS_createPath"]("/","lib",true,true);Module["FS_createPath"]("/lib","python3.9",true,true);Module["FS_createPath"]("/lib/python3.9","site-packages",true,true);Module["FS_createPath"]("/lib/python3.9/site-packages","logbook",true,true);Module["FS_createPath"]("/lib/python3.9/site-packages","Logbook-1.5.2-py3.9.egg-info",true,true);function processPackageData(arrayBuffer){assert(arrayBuffer,"Loading data file failed.");assert(arrayBuffer instanceof ArrayBuffer,"bad input to processPackageData");var byteArray=new Uint8Array(arrayBuffer);var curr;var compressedData={data:null,cachedOffset:197942,cachedIndexes:[-1,-1],cachedChunks:[null,null],offsets:[0,1278,2380,3145,4106,5058,6386,7618,8897,9911,10930,12255,13528,14897,16194,17442,18726,19469,20595,21437,22506,23591,24847,26091,27460,28619,30043,31173,32302,33520,34677,35779,36942,37916,39085,40174,41585,42861,44194,45528,46817,47837,49087,50159,51471,52639,53630,54752,56095,57303,58464,59518,60768,61347,62178,63691,64819,66069,67295,68287,69429,70636,71704,72706,73780,74819,76249,77527,78751,79917,81160,82179,83389,84691,85998,87309,88531,89707,90988,92123,93356,94375,95500,96753,97892,99018,100231,101353,102452,103825,105030,106322,107551,108785,109924,111158,112371,113542,114661,115800,116919,118236,119280,120444,121336,122263,123435,124469,125425,126766,128041,129219,130175,131594,132853,134139,135269,136506,137811,138709,139545,140587,141823,142832,143981,144835,145645,146861,148292,149692,151155,152570,154103,155476,156721,158095,159281,160599,161630,162744,164307,165785,167023,168426,169611,171121,172325,173816,175280,176619,178010,179280,180743,182073,183270,184169,185567,187023,188386,189774,191293,192498,193237,194300,195094,195768,196394,197602],sizes:[1278,1102,765,961,952,1328,1232,1279,1014,1019,1325,1273,1369,1297,1248,1284,743,1126,842,1069,1085,1256,1244,1369,1159,1424,1130,1129,1218,1157,1102,1163,974,1169,1089,1411,1276,1333,1334,1289,1020,1250,1072,1312,1168,991,1122,1343,1208,1161,1054,1250,579,831,1513,1128,1250,1226,992,1142,1207,1068,1002,1074,1039,1430,1278,1224,1166,1243,1019,1210,1302,1307,1311,1222,1176,1281,1135,1233,1019,1125,1253,1139,1126,1213,1122,1099,1373,1205,1292,1229,1234,1139,1234,1213,1171,1119,1139,1119,1317,1044,1164,892,927,1172,1034,956,1341,1275,1178,956,1419,1259,1286,1130,1237,1305,898,836,1042,1236,1009,1149,854,810,1216,1431,1400,1463,1415,1533,1373,1245,1374,1186,1318,1031,1114,1563,1478,1238,1403,1185,1510,1204,1491,1464,1339,1391,1270,1463,1330,1197,899,1398,1456,1363,1388,1519,1205,739,1063,794,674,626,1208,340],successes:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]};compressedData["data"]=byteArray;assert(typeof Module.LZ4==="object","LZ4 not present - was your app build with  -s LZ4=1  ?");Module.LZ4.loadPackage({metadata:metadata,compressedData:compressedData},true);Module["removeRunDependency"]("datafile_logbook.data")}Module["addRunDependency"]("datafile_logbook.data");if(!Module.preloadResults)Module.preloadResults={};Module.preloadResults[PACKAGE_NAME]={fromCache:false};if(fetched){processPackageData(fetched);fetched=null}else{fetchedCallback=processPackageData}}if(Module["calledRun"]){runWithFS()}else{if(!Module["preRun"])Module["preRun"]=[];Module["preRun"].push(runWithFS)}};loadPackage({files:[{filename:"/lib/python3.9/site-packages/logbook/__init__.py",start:0,end:1772,audio:0},{filename:"/lib/python3.9/site-packages/logbook/__version__.py",start:1772,end:1794,audio:0},{filename:"/lib/python3.9/site-packages/logbook/_fallback.py",start:1794,end:9906,audio:0},{filename:"/lib/python3.9/site-packages/logbook/_termcolors.py",start:9906,end:11044,audio:0},{filename:"/lib/python3.9/site-packages/logbook/base.py",start:11044,end:52388,audio:0},{filename:"/lib/python3.9/site-packages/logbook/compat.py",start:52388,end:62744,audio:0},{filename:"/lib/python3.9/site-packages/logbook/concurrency.py",start:62744,end:69001,audio:0},{filename:"/lib/python3.9/site-packages/logbook/handlers.py",start:69001,end:140506,audio:0},{filename:"/lib/python3.9/site-packages/logbook/helpers.py",start:140506,end:148802,audio:0},{filename:"/lib/python3.9/site-packages/logbook/more.py",start:148802,end:168578,audio:0},{filename:"/lib/python3.9/site-packages/logbook/notifiers.py",start:168578,end:180613,audio:0},{filename:"/lib/python3.9/site-packages/logbook/queues.py",start:180613,end:205276,audio:0},{filename:"/lib/python3.9/site-packages/logbook/ticketing.py",start:205276,end:224507,audio:0},{filename:"/lib/python3.9/site-packages/logbook/utils.py",start:224507,end:230290,audio:0},{filename:"/lib/python3.9/site-packages/logbook/_speedups.so",start:230290,end:339038,audio:0},{filename:"/lib/python3.9/site-packages/Logbook-1.5.2-py3.9.egg-info/PKG-INFO",start:339038,end:341157,audio:0},{filename:"/lib/python3.9/site-packages/Logbook-1.5.2-py3.9.egg-info/not-zip-safe",start:341157,end:341158,audio:0},{filename:"/lib/python3.9/site-packages/Logbook-1.5.2-py3.9.egg-info/dependency_links.txt",start:341158,end:341159,audio:0},{filename:"/lib/python3.9/site-packages/Logbook-1.5.2-py3.9.egg-info/requires.txt",start:341159,end:341445,audio:0},{filename:"/lib/python3.9/site-packages/Logbook-1.5.2-py3.9.egg-info/top_level.txt",start:341445,end:341453,audio:0},{filename:"/lib/python3.9/site-packages/Logbook-1.5.2-py3.9.egg-info/SOURCES.txt",start:341453,end:342776,audio:0}],remote_package_size:202038,package_uuid:"cd071b3b-3171-4561-b591-76010e46d252"})})();