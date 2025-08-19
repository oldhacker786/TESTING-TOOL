function sendOTP() {
  let number = document.getElementById("number").value;
  if (!number) {
    alert("Please enter your number");
    return;
  }

  // 🔴 Replace with your OTP API
  console.log("https://selfcare-msa-prod.jazz.com.pk/onboarding/loginbyotp", number);

  document.getElementById("step1").style.display = "none";
  document.getElementById("step2").style.display = "block";
  document.getElementById("message").innerText = "OTP sent to " + number;
}

function verifyOTP() {
  let otp = document.getElementById("otp").value;
  if (!otp) {
    alert("Please enter OTP");
    return;
  }

  // 🔴 Replace with your OTP Verify API
  console.log("Verifying OTP:", otp);

  document.getElementById("step2").style.display = "none";
  document.getElementById("step3").style.display = "block";
  document.getElementById("message").innerText = "OTP Verified Successfully!";
}

function claimGift() {
  // 🔴 Replace with your REAL Gift Claim API
  console.log("https://selfcare-msa-prod.jazz.com.pk/gamification/claim");

  // Example success
  document.getElementById("message").innerText = "🎉 Congratulations! Gift MB Claimed Successfully!";
}
