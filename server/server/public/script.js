const logo=document.getElementById("Logo");
function goToHome(){
    window.location="login.html";}
async function signup() {
    const username=document.getElementById("username").value;
    const email=document.getElementById("email").value;

    const res=await fetch("/signup",{
        method: "POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username,email})
    });
    const data=await res.text();
    alert(data);
    window.location="login.html";
}
async function login(){
    const username=document.getElementById("username").value;
    const email=document.getElementById("email").value;
    
    // Currently there is no /login endpoint on the server.
    // This function does basic client-side validation and shows a message.
    if(!username || !email){
        alert('username and email are required');
        return;
    }
   try{
    const res=await fetch("/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username,email})
    });
    const data=await res.json();  
    if (data.success) {
      alert("✅ Login successful!");
      window.location = "index.html";
    } else {
      alert("❌ Invalid username or email. Please try again or sign up.");
    }
   }
   catch (err) {
    console.error("Login error:", err);
    alert("⚠️ Error connecting to server.");
  }
   
    
}
async function searchProduct() {
  const query = document.getElementById("search").value.trim();
  const productDiv = document.getElementById("products");
  const banner = document.getElementById("img3"); // 👈 get the banner image

  // If search box is empty
  if (!query) {
    productDiv.innerHTML = "";     // clear search results
    banner.style.display = "block"; // show banner again
    return;
  }

  // Hide the banner when typing
  banner.style.display = "none";

  try {
    const res = await fetch(`/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) {
      console.error("Error fetching products");
      return;
    }

    const products = await res.json();

    if (products.length === 0) {
      productDiv.innerHTML = "<p>No products found</p>";
    } else {
      productDiv.innerHTML = products /*When you use .map(...) to loop through each product and generate HTML like this:*/ 
        .map(
          (p) => `
          <div class="product-item">
            <h3>${p.name}</h3>
            <p>ID: ${p.id}</p>
            <p>Brand: ${p.brand}</p>
            <p>Price: ₹${p.price}</p>
            <p>userid: ${p.userid}</p>
           <button onclick="placeOrder(${p.id}, \`${p.name}\`, \`${p.brand}\`,\` ${p.price}\`,${p.userid})">
  Place Order
</button>

          </div>`
        )
        .join("");// join to convert array to string
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}


async function placeOrder(id, name, brand, price) {
    const userid=1;
    
    try{
    const res=await fetch("/order_s",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
         body: JSON.stringify({
        productid: id,
        productName: name,
        productBrand: brand,
        productPrice: price,
        userid: userid
    })                           
    });
    const data=await res.text();
    alert(data);
    console.log("Order response:", data);

    // ✅ Redirect to thankyou page with query parameters
    window.location = `thankyou.html?userid=${encodeURIComponent(userid)}&product=${encodeURIComponent(name)}`;
  } 
  catch (err) {
    console.error("Order error:", err);
    alert("Error placing order.");
  }
}