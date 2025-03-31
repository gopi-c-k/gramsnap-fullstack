const updateMetaTags = (title, description, imageUrl) => {
    document.title = title;
  
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
  
    let metaOgImage = document.querySelector('meta[property="og:image"]');
    if (!metaOgImage) {
      metaOgImage = document.createElement("meta");
      metaOgImage.setAttribute("property", "og:image");
      document.head.appendChild(metaOgImage);
    }
    metaOgImage.content = imageUrl;
  };
  
  export default updateMetaTags;
  