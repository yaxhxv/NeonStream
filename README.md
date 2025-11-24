# NeonStream - Synchronized Multi-Stream Video Dashboard

This repository contains the complete source code for NeonStream, a web-based dashboard designed to display multiple HLS video streams in a synchronized grid layout. The application is built with React for the frontend and a Node.js/Express backend, with a dedicated media server for video processing.

● **Live Demo:** [https://neon-stream.web.app/](https://neon-stream.web.app/)

● **Dashboard Code (GitHub):** [https://github.com/Yash-Nawgiri/NeonStream.git](https://github.com/Yash-Nawgiri/NeonStream.git)

---

## Core Features

*   **Multi-Stream Grid:** Displays a 3x2 grid of 6 distinct video streams.
*   **Synchronized Playback:** All video players start, stop, and seek in unison, maintaining perfect synchronization.
*   **HLS Conversion:** Features a backend service capable of converting video feeds (e.g., RTSP) into the web-friendly HLS format in real-time.
*   **Dynamic Loading:** Fetches available stream URLs from a backend API.
*   **Centralized Controls:** A single set of UI controls manages the playback state of all video streams simultaneously.

---

## Technical Documentation

### 1. RTSP → HLS Conversion Process

The real-time conversion of video streams from RTSP (or other formats) to HLS (HTTP Live Streaming) is handled by **`mediamtx`**, a powerful and ready-to-use real-time media server.

*   **How it Works:** We deployed `mediamtx` as a Docker container on the Render cloud platform. It is configured using a `mediamtx.yml` file, which defines the paths for incoming and outgoing streams. When `mediamtx` receives a video feed on a specified path, it automatically re-muxes (converts) it into the HLS format.
*   **HLS Format:** HLS breaks the video into small `.ts` (transport stream) segments and creates a `.m3u8` playlist file that tells the player the order in which to download and play those segments. This makes it compatible with virtually all web browsers.
*   **Deployment:** The `mediamtx` server runs independently of the main application backend. The Node.js backend simply queries `mediamtx` to get the final HLS stream URLs.

### 2. Simulating 6 Distinct HLS Streams

For this demonstration, instead of connecting to 6 unique, live RTSP cameras, we simulated 6 distinct stream endpoints using a single public video source.

This was configured in the `mediamtx.yml` file:
```yaml
paths:
  stream1:
    source: https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
    sourceOnDemand: yes
  stream2:
    source: https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
    sourceOnDemand: yes
  # ...and so on for stream3 to stream6
```
*   **Explanation:** We define 6 unique paths (`stream1`, `stream2`, etc.). Each path is configured to pull video data from the same HLS test stream provided by `mux.dev`.
*   **`sourceOnDemand: yes`:** This is a crucial optimization. It tells `mediamtx` not to pull the source stream until a user actually connects to one of the paths (`/hls/stream1/`, etc.). This prevents unnecessary bandwidth usage.
*   **Backend API:** The Node.js backend exposes an `/api/streams` endpoint. When called, it constructs the full HLS URLs for each of the 6 paths (e.g., `https://<mediamtx-url>/hls/stream1/index.m3u8`) and sends them to the frontend.

### 3. React Component Logic for Stream Synchronization

The core challenge is ensuring all 6 video players are perfectly synchronized. This was achieved using a **Leader-Follower** model.

1.  **Designating a Leader:** The first video player in the grid is designated as the "leader." All other players are "followers."
    ```jsx
    // In App.jsx
    <PlayerWrapper
      isLeader={url === streamUrls[0]}
      // ...
    />
    ```
2.  **Leader Reports Time:** The leader player is the only one with an active `onTimeUpdate` event listener. This listener fires continuously during playback, reporting its current time (`currentTime`) back to the main `<App>` component. This time is stored in a state variable called `leaderTime`.
    ```jsx
    // In App.jsx
    const handleLeaderTimeUpdate = useCallback((time) => {
      setLeaderTime(time);
    }, []);
    ```
3.  **Followers Sync to Leader:** The `leaderTime` is passed down as a prop (`syncTime`) to all follower players.
    ```jsx
    // In App.jsx
    <PlayerWrapper
      // ...
      syncTime={leaderTime}
    />
    ```
4.  **Synchronization Logic:** Inside the `VideoPlayer` component, a `useEffect` hook watches for changes to the `syncTime` prop. If the component is a follower, it constantly compares its own `currentTime` to the leader's `syncTime`. If the difference (drift) exceeds a small threshold (e.g., 0.5 seconds), it programmatically sets its own time to match the leader's, instantly correcting any lag or drift.
    ```jsx
    // In VideoPlayer.jsx
    useEffect(() => {
      if (isLeader || !syncTime) return;
      const video = videoRef.current;
      // If the drift is significant, resync.
      if (Math.abs(video.currentTime - syncTime) > 0.5) {
        video.currentTime = syncTime;
      }
    }, [syncTime, isLeader]);
    ```
5.  **Centralized Controls:** To control play/pause for all streams at once, we use `useRef` to hold a reference to each `VideoPlayer` instance. `useImperativeHandle` is used within `VideoPlayer` to expose `play()` and `pause()` methods. The main play/pause buttons in `App.jsx` simply iterate through this array of refs and call the appropriate method on each player.

---

## How to Set Up and Run

Follow these instructions to get the project running on your local machine.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm (comes with Node.js)

### Environment Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Yash-Nawgiri/NeonStream.git
    cd NeonStream
    ```

2.  **Set Up the Backend:**
    *   Navigate to the backend directory:
        ```bash
        cd backend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Create a `.env` file in the `backend` directory and add the following variable. This should be the public URL of a running `mediamtx` instance.
        ```
        MEDIAMTX_URL=https://your-mediamtx-server-url.com
        ```

3.  **Set Up the Frontend:**
    *   Navigate to the frontend directory from the root folder:
        ```bash
        cd ../frontend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```

### Running the Application

1.  **Start the Backend Server:**
    *   In the `backend` directory, run:
        ```bash
        npm start
        ```
    *   The backend will start, typically on `http://localhost:3001`.

2.  **Start the Frontend Development Server:**
    *   In a separate terminal, go to the `frontend` directory and run:
        ```bash
        npm run dev
        ```
    *   The React development server will start, and the application will open in your browser, usually at `http://localhost:5173`.
