import {useCallback} from "react";
import {destroyNotenState} from "../../persistence/persistence.ts";


export const DebugComponent = () => {
  const resetData = useCallback(() => {
    destroyNotenState();
    window.location.hash = "";
    window.location.reload();
  }, []);
  return (
    <div>
      <p>Debug Console</p>
      <button className="button" onClick={resetData}>Destroy ALL persisted data</button>
    </div>
  );
};