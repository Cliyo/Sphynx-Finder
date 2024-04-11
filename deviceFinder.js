import find from 'local-devices';

async function scanNetwork(){
  try {
    const devices = await find();

    return devices
  
  } catch (error) {
    console.error('Error:', error);
  }
};

export default scanNetwork;