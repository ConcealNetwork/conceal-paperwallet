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

  $('#qrcode').qrcode($("#address_widget").html());
  $("#qrcode").show();
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
  dlAnchorElem.setAttribute("download", "xuniKeys.json");
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
  } catch (err) {
    $("#restoreError").html(err);
    $("#restoreError").show();
  }
};

var backToHomepage = function () {
  window.location.href = 'https://paperwallet.ultranote.org/';
}

var genwallet = function (lang) {
  document.getElementById("step2").style.display = "block";
  var spend_key_widget = document.getElementById("spend_key_widget");
  var view_key_widget = document.getElementById("view_key_widget");
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
 

  initializeQrCode();
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




