const apartmentsData = [
  {
    title_en: "Minos Two Bedroom Apartment",
    title_el: "Μίνωος: Two Bedroom Apartment",
    floor_en: "1st Floor",
    floor_el: "1ος Όροφος",
    capacity: 6,
    amenities_en: ["Balcony with street view", "Washing machine included"],
    amenities_el: ["Μπαλκόνι με θέα στο δρόμο", "Πλυντήριο ρούχων"],
    images: [
      "/apartments/minos-1st-floor/image00001.jpeg",
      "/apartments/minos-1st-floor/image00002.jpeg",
      "/apartments/minos-1st-floor/image00003.jpeg",
      "/apartments/minos-1st-floor/image00004.jpeg",
      "/apartments/minos-1st-floor/image00005.jpeg",
      "/apartments/minos-1st-floor/image00006.jpeg",
      "/apartments/minos-1st-floor/image00008.jpeg",
      "/apartments/minos-1st-floor/image00009.jpeg",
      "/apartments/minos-1st-floor/image00010.jpeg",
      "/apartments/minos-1st-floor/image00011.jpeg",
      "/apartments/minos-1st-floor/image00012.jpeg",
      "/apartments/minos-1st-floor/image00014.jpeg",
      "/apartments/minos-1st-floor/image00015.jpeg",
      "/apartments/minos-1st-floor/image00016.jpeg",
      "/apartments/minos-1st-floor/image00017.jpeg",
      "/apartments/minos-1st-floor/image00018.jpeg",
      "/apartments/minos-1st-floor/image00019.jpeg",
      "/apartments/minos-1st-floor/image00020.jpeg",
      "/apartments/minos-1st-floor/image00021.jpeg",
      "/apartments/minos-1st-floor/image00022.jpeg",
      "/apartments/minos-1st-floor/image00023.jpeg",
      "/apartments/minos-1st-floor/image00024.jpeg",
      "/apartments/minos-1st-floor/image00025.jpeg",
      "/apartments/minos-1st-floor/image00026.jpeg",
      "/apartments/minos-1st-floor/image00027.jpeg",
      "/apartments/minos-1st-floor/image00028.jpeg",
      "/apartments/minos-1st-floor/image00029.jpeg",
      "/apartments/minos-1st-floor/image00030.jpeg",
      "/apartments/minos-1st-floor/image00031.jpeg",
      "/apartments/minos-1st-floor/image00032.jpeg",
      "/apartments/minos-1st-floor/image00033.jpeg",
      "/apartments/minos-1st-floor/image00034.jpeg"
    ],
    status: "available"
  },
  {
    title_en: "Minos Standard Studio with Yard",
    title_el: "Μίνωος: Standard Studio with Yard",
    floor_en: "Ground Floor",
    floor_el: "Ισόγειο",
    capacity: 2,
    amenities_en: ["Private yard access"],
    amenities_el: ["Πρόσβαση σε αυλή"],
    images: [
      "/apartments/minos-white/20181120_174443.jpg",
      "/apartments/minos-white/20181120_174449.jpg",
      "/apartments/minos-white/20181120_174518.jpg",
      "/apartments/minos-white/DSC_0002.jpg",
      "/apartments/minos-white/DSC_0003.jpg",
      "/apartments/minos-white/DSC_0004.jpg",
      "/apartments/minos-white/DSC_0005.jpg",
      "/apartments/minos-white/DSC_0006.jpg",
      "/apartments/minos-white/DSC_0007.jpg",
      "/apartments/minos-white/DSC_0008.jpg",
      "/apartments/minos-white/DSC_0009.jpg",
      "/apartments/minos-white/DSC_0010.jpg"
    ],
    status: "available"
  },
  {
    title_en: "Minos Standard Studio",
    title_el: "Μίνωος: Standard Studio",
    floor_en: "Ground Floor",
    floor_el: "Ισόγειο",
    capacity: 2,
    amenities_en: ["Comfortable standard studio setup"],
    amenities_el: ["Άνετος χώρος studio"],
    images: [
      "/apartments/minos-standard/image00001.jpeg",
      "/apartments/minos-standard/image00002.jpeg",
      "/apartments/minos-standard/image00003.jpeg",
      "/apartments/minos-standard/image00005.jpeg",
      "/apartments/minos-standard/image00006.jpeg",
      "/apartments/minos-standard/image00007.jpeg",
      "/apartments/minos-standard/image00009.jpeg",
      "/apartments/minos-standard/image00010.jpeg"
    ],
    status: "available"
  },
  {
    title_en: "Minos Deluxe Apartment",
    title_el: "Μίνωος: Deluxe Apartment",
    floor_en: "Ground Floor",
    floor_el: "Ισόγειο",
    capacity: 2,
    amenities_en: ["Private yard", "Queen size bed"],
    amenities_el: ["Ιδιωτική αυλή", "Κρεβάτι Queen size"],
    images: [
      "/apartments/minos-deluxe/image00002.jpeg",
      "/apartments/minos-deluxe/image00003.jpeg",
      "/apartments/minos-deluxe/image00004.jpeg",
      "/apartments/minos-deluxe/image00005.jpeg",
      "/apartments/minos-deluxe/image00006.jpeg",
      "/apartments/minos-deluxe/image00007.jpeg",
      "/apartments/minos-deluxe/image00008.jpeg",
      "/apartments/minos-deluxe/image00009.jpeg",
      "/apartments/minos-deluxe/sign.jpg",
      "/apartments/minos-deluxe/yard.jpg"
    ],
    status: "available"
  }
];

async function seed() {
  console.log('Inserting apartments...');
  
  const response = await fetch('https://iapjkfvzlkqqglymdpfh.supabase.co/rest/v1/apartments', {
    method: 'POST',
    headers: {
      'apikey': 'sb_publishable_T82U8pfpSNL-o4D08LM9_A_1CJ_0u9a',
      'Authorization': 'Bearer sb_publishable_T82U8pfpSNL-o4D08LM9_A_1CJ_0u9a',
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(apartmentsData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error inserting apartments:', errorText);
  } else {
    console.log('Successfully inserted apartments!');
  }
}

seed();
