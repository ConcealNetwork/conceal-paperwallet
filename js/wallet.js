var show_generate = function () {
  $("#user_entropy_widget").val(randomWords(15));
  document.getElementById("generate").style.display = "block";
  document.getElementById("restore").style.display = "none";
  document.getElementById("step2").style.display = "none";
  document.getElementById("intro").style.display = "none";
};

var show_restore = function () {
  document.getElementById("restore").style.display = "block";
  document.getElementById("generate").style.display = "none";
  document.getElementById("step2").style.display = "none";
  document.getElementById("intro").style.display = "none";
  $("#restoreError").hide();
};

var getStringWords = function (string) {
  return string.replace(/^\s*(.*)\s*$/, '$1').replace(/\s+/, ' ').split(' ');
};

var genkeys = function (additional_entropy, lang) {
  var seed = cnUtil.sc_reduce32(poor_mans_kdf(additional_entropy + cnUtil.rand_32()));
  var keys = cnUtil.create_address(seed);
  var passPhrase = mn_encode(seed, lang);
  return {
    keys: keys,
    mnemonic: passPhrase
  }
};

function initializeQrCode() {
  $('#qrcode').hide();
  $('#qrcode').html("");

  $(".copyToClipboard").off("click").on("click", function () {
    copyToClipboard($(this).html());
    iziToast.success({
      title: "Copied", message: "Content was copied to clipboard", position: "topRight",
      backgroundColor: "orange",
      messageColor: "#333",
      timeout: 2000,
    });
  });

  $('#qrcode').qrcode({
    text: $("#address_widget").html(),
    width: 160,
    height: 160,
    correctLevel: 2,   // High error correction level (Q = 2)
    background: "#ffffff",
    foreground: "#000000"
  });
  
  // Add padding around the QR code using CSS
  $('#qrCodeWrapper').css({
    'padding': '10px',
    'background-color': '#ffffff',
    'display': 'inline-block'
  });
  
  $("#qrcode").show();
}

function initializeImportQrCode() {
  try {
    $('#importQrCode').hide();
    $('#importQrCode').html("");
    
    var address = $("#address_widget").html();
    var spendKey = $("#spend_key_widget").html();
    var viewKey = $("#view_key_widget").html();
    //var mnemonicSeed = $("#mnemonic_widget").html();
    
    // Create import string without mnemonic seed (too large for QR code)
    var importString = "conceal." + address + 
                      "?spend_key=" + spendKey + 
                      "?view_key=" + viewKey;
    
    // Remove mnemonic from QR code due to length limitations
    // "?mnemonic_seed=" + encodeURIComponent(mnemonicSeed)
    
    // Create QR code with optimized parameters for better readability
    $('#importQrCode').qrcode({
      text: importString,
      width: 240,
      height: 240,
      correctLevel: 3,   // Highest error correction level (H)
      typeNumber: 0,     // Auto-detect appropriate type number
      background: "#ffffff",
      foreground: "#000000"
    });
    
    // Add padding around the QR code using CSS
    $('#importQrCodeWrapper').css({
      'padding': '15px',
      'background-color': '#ffffff',
      'display': 'inline-block'
    });
    
    $("#importQrCode").show();
  } catch (err) {
    console.error("QR Code generation error:", err);
    // Show error message to user if needed
    $('#importQrCode').html("<div class='alert alert-danger'>QR code generation failed. The data might be too large.</div>");
    $("#importQrCode").show();
  }
}

var keys_download = function () {
  var keysAsJSON = {
    address: $("#address_widget").html(),
    seedPhrase: $("#mnemonic_widget").html(),
    privateSpendKey: $("#spend_key_widget").html(),
    privateViewKey: $("#view_key_widget").html()
    //privateKey: $("#private_keys_widget").html()
  }

  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(keysAsJSON));
  var dlAnchorElem = document.getElementById('downloadAnchorElem');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "ccxKeys.json");
  dlAnchorElem.click();
}

var restore_keys = function (lang) {
  $("#restoreError").hide();
  try {
    var seed_phrase = document.getElementById("seed_phrase").value;
    var seed = mn_decode(seed_phrase);
    var keys = cnUtil.create_address(seed);

    address_widget.innerHTML = keys.public_addr;
    mnemonic_widget.innerHTML = seed_phrase;
    spend_key_widget.innerHTML = keys.spend.sec;
    view_key_widget.innerHTML = keys.view.sec;

    document.getElementById("step2").style.display = "block";
    initializeQrCode();
    initializeImportQrCode();
  } catch (err) {
    $("#restoreError").html(err);
    $("#restoreError").show();
  }
};

var backToHomepage = function () {
  window.location.href = 'https://conceal.network';
}

var genwallet = function (lang) {
  document.getElementById("step2").style.display = "block";
  var spend_key_widget = document.getElementById("spend_key_widget");
  var view_key_widget = document.getElementById("view_key_widget");
  //var private_keys_widget = document.getElementById("private_keys_widget");
  var address_widget = document.getElementById("address_widget");
  var address_qr_widget = document.getElementById("address_qr_widget");
  var user_entropy_widget = document.getElementById("user_entropy_widget");

  var res = genkeys(user_entropy_widget.value, lang);
  var keys = res.keys;
  var mnemonic = res.mnemonic;

  address_widget.innerHTML = keys.public_addr;
  mnemonic_widget.innerHTML = mnemonic;
  spend_key_widget.innerHTML = keys.spend.sec;
  view_key_widget.innerHTML = keys.view.sec;
  //private_keys_widget.innerHTML = keys.privateKeys;

  // wallet_keys_widget.innerHTML = keys.privateKeys;
  //address_qr_widget.innerHTML = "";
  //qr=new QRCode(address_qr_widget, {correctLevel:QRCode.CorrectLevel.L});
  //qr.makeCode("conceal:"+keys.public_addr);

  initializeQrCode();
  initializeImportQrCode();
};

function copyToClipboard(text) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand("copy");
  $temp.remove();
}

$(document).ready(function () {
  $("#btnBackToHomepage").click(function () {
    backToHomepage();
  });

  $("#btnShowGenerate").click(function () {
    show_generate();
  });

  $("#btnShowRestore").click(function () {
    show_restore();
  });

  $("#btnGenerateWallet").click(function () {
    genwallet(null);
  });

  $("#btnRestoreKeys").click(function () {
    restore_keys(null);
  });

  $("#btnPagePrint").click(function () {
    window.print();
  });

  $("#btnDownloadKeys").click(function () {
    keys_download();
  });
});

/*
previous_button_text = "";
prefix = "";
function genwallet_prefix_worker()
{
  attempts = 0;
  while (true) {
    attempts++;
    seed = cnUtil.sc_reduce32(cnUtil.rand_32());
	var passPhrase = mn_encode(seed,current_lang);
	var words = getStringWords(passPhrase);
	seed = CryptoJS.SHA256(salt + words.join(' ')).toString();
    keys = cnUtil.create_address_if_prefix(seed,prefix);
    if (keys != null) {
      gen_prefix_widget = document.getElementById("gen_prefix_widget");
      prefix_widget = document.getElementById("prefix_widget");
      gen_prefix_widget.value = previous_button_text;
      prefix_widget.disabled = false;
      generating = false;
      break;
    }
    if (attempts == 10) {
      if (generating)
        setTimeout(genwallet_prefix_worker, 0);
      return;
    }
  }
  mnemonic = passPhrase;

  spend_key_widget = document.getElementById("spend_key_widget");
  view_key_widget = document.getElementById("view_key_widget");
  address_widget = document.getElementById("address_widget");
  // mnemonic_widget = document.getElementById("mnemonic_widget");

  spend_key_widget.innerHTML = keys.spend.sec;
  view_key_widget.innerHTML = keys.view.sec;
  address_widget.innerHTML = keys.public_addr;
  address_qr_widget.innerHTML = "";
  // mnemonic_widget.innerHTML = mnemonic;

  wallet_keys_widget.innerHTML = keys.privateKeys;

  qr=new QRCode(address_qr_widget, {correctLevel:QRCode.CorrectLevel.L});
  qr.makeCode("conceal:"+keys.public_addr);
}

var zerohex="0000000000000000000000000000000000000000000000000000000000000000";
var ffhex="ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
var lowest_address=cnUtil.pubkeys_to_string(zerohex,zerohex);
var highest_address=cnUtil.pubkeys_to_string(ffhex,ffhex);

function is_valid_prefix(prefix)
{
  if (prefix.length <= 0 || prefix.length >= 95)
    return false;
  var lowest=lowest_address.substr(0,prefix.length);
  var highest=highest_address.substr(0,prefix.length);
  if (prefix<lowest)
    return false;
  if (prefix>highest)
    return false;
  return true;
}

function check_prefix_validity()
{
  gen_prefix_widget = document.getElementById("gen_prefix_widget");
  prefix_widget = document.getElementById("prefix_widget");
  if (gen_prefix_widget.value == "STOP")
    return;
  prefix=prefix_widget.value;
  if (is_valid_prefix(prefix)) {
    gen_prefix_widget.value = "Generate wallet with prefix";
    gen_prefix_widget.disabled = false;
  }
  else {
    gen_prefix_widget.value = "Invalid prefix";
    gen_prefix_widget.disabled = true;
  }
}

generating = false;
function genwallet_prefix()
{
  gen_prefix_widget = document.getElementById("gen_prefix_widget");
  prefix_widget = document.getElementById("prefix_widget");
  if (generating) {
    generating = false;
    gen_prefix_widget.value = previous_button_text;
    prefix_widget.disabled = false;
  }
  else {
    prefix_widget = document.getElementById("prefix_widget");
    prefix = prefix_widget.value;
    prefix.trim();
    if (prefix.length < 5 || prefix[0] != "ccx7") {
      alert("Bad prefix "+prefix+" should start with K and be at least one extra character");
      return;
    }
    if (!is_valid_prefix(prefix)) {
      alert("Bad prefix "+prefix+" is not a valid address prefix");
      return;
    }

    generating = true;
    previous_button_text = gen_prefix_widget.value;
    gen_prefix_widget.value = "STOP";
    prefix_widget.disabled = true;
    setTimeout(genwallet_prefix_worker, 0);
  }
}
*/

// function toggle_qr()
// {
//   address_qr_widget = document.getElementById("address_qr_widget");
//   spend_key_widget = document.getElementById("spend_key_widget");
//   view_key_widget = document.getElementById("view_key_widget");
//   // mnemonic_widget = document.getElementById("mnemonic_widget");
//   if (address_qr_widget.style.display=="block") {
//     address_qr_widget.style.display="none";
//     spend_key_widget.style.display = "block";
//     view_key_widget.style.display = "block";
//     // mnemonic_widget.style.display = "block";
//   }
//   else {
//     address_qr_widget.style.display="block";
//     spend_key_widget.style.display = "none";
//     view_key_widget.style.display = "none";
//     // mnemonic_widget.style.display = "none";
//   }
// }
