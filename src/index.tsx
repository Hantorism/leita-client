import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import { AlertProvider } from './contexts/AlertContext';

const container = document.getElementById('root');
if (!container) {
	throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(container);
root.render(
	<AlertProvider>
		<BrowserRouter>
			<App/>
		</BrowserRouter>
	</AlertProvider>,
);
