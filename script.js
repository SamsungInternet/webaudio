
    let audioContext;
    let audioBuffer, sourceNode, gainNode, filterNode;
    let isPlaying = false;
    let audioUrl = '/media/powerful.mp3'; // Your hosted file

    // Initialize the AudioContext
    function initAudioContext() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext initialized.');
        document.getElementById('status').innerText = 'AudioContext initialized.';
      }
    }

    // Fetch and decode the audio file
    function loadAudio() {
      console.log(`Starting to load audio from ${audioUrl}...`);

      // Ensure the AudioContext is initialized before loading audio
      initAudioContext();

      fetch(audioUrl)
        .then(response => {
          console.log('Audio fetch response:', response);
          if (!response.ok) {
            throw new Error(`Failed to fetch audio file: ${response.statusText}`);
          }
          return response.arrayBuffer();
        })
        .then(data => {
          console.log('Audio file fetched, decoding audio data...');
          return audioContext.decodeAudioData(data);
        })
        .then(buffer => {
          audioBuffer = buffer;
          console.log('Audio file decoded successfully!');
          document.getElementById('status').innerText = 'Audio file loaded!';
        })
        .catch(error => {
          console.error('Error loading audio file:', error);
          document.getElementById('status').innerText = `Error loading audio file: ${error.message}`;
        });
    }

    // Function to play or pause the audio
    function playPause() {
      if (!audioBuffer) {
        document.getElementById('status').innerText = 'Audio file not loaded yet!';
        console.log('Audio file not loaded yet, aborting play.');
        return;
      }

      if (isPlaying) {
        console.log('Pausing the audio...');
        sourceNode.stop();
        isPlaying = false;
        document.getElementById('playPause').innerText = 'Play';
      } else {
        console.log('Playing the audio...');
        startAudio();
        isPlaying = true;
        document.getElementById('playPause').innerText = 'Pause';
      }
    }

    // Start audio playback
    function startAudio() {
      sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;

      gainNode = audioContext.createGain();
      sourceNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      sourceNode.playbackRate.value = document.getElementById('speedControl').value;
      sourceNode.start();

      console.log('Audio started playing.');
    }

    // Adjust playback speed
    document.getElementById('speedControl').addEventListener('input', (event) => {
      let speed = event.target.value;
      document.getElementById('speedValue').innerText = `${speed}x`;
      if (sourceNode) sourceNode.playbackRate.value = speed;
    });

    // Add a lowpass filter
    document.getElementById('lowpass').addEventListener('click', () => {
      if (!isPlaying) {
        document.getElementById('status').innerText = 'Play the audio first!';
        return;
      }
      if (filterNode) filterNode.disconnect();
      filterNode = audioContext.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(1000, audioContext.currentTime);
      gainNode.disconnect();
      gainNode.connect(filterNode);
      filterNode.connect(audioContext.destination);
    });

    // Add a highpass filter
    document.getElementById('highpass').addEventListener('click', () => {
      if (!isPlaying) {
        document.getElementById('status').innerText = 'Play the audio first!';
        return;
      }
      if (filterNode) filterNode.disconnect();
      filterNode = audioContext.createBiquadFilter();
      filterNode.type = 'highpass';
      filterNode.frequency.setValueAtTime(1000, audioContext.currentTime);
      gainNode.disconnect();
      gainNode.connect(filterNode);
      filterNode.connect(audioContext.destination);
    });

    // Remove any active filter
    document.getElementById('removeFilter').addEventListener('click', () => {
      if (filterNode) filterNode.disconnect();
      gainNode.disconnect();
      gainNode.connect(audioContext.destination);
    });

    // Initialize AudioContext and load audio on button click
    document.getElementById('playPause').addEventListener('click', () => {
      playPause(); // Play or pause the audio
    });

    // Load the audio file when the page is ready
    window.addEventListener('load', loadAudio);
