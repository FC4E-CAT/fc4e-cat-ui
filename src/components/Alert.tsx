/**
 * Small component to display an alert.
 * Receives two props (type:string ,message:string ) - type is declared inline
 */
export const Alert = ({ type, message }: { type: string; message: string }) => {
  return (
    <div className={`alert alert-${type} alert-dismissible`} role="alert">
      <div>{message}</div>
    </div>
  );
};
