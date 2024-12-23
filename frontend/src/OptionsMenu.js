import {React} from "react";

const OptionsMenu = ({setShowFilterModal}) => {

    return (
        <div className="text-start py-3 px-2" style={
            {
                "height": "80vh",
                "backgroundColor": "#f8f9fa",
            }
        }>
            <h2>Seçenekler</h2>
            <button className="btn btn-info my-3" onClick={() => setShowFilterModal(true)}>
                Filter by Time
            </button>
        </div>
    );
}

export default OptionsMenu;