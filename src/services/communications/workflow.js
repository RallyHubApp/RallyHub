export function nextWorkflowAction({workflow,state,now=new Date()}){
 if(!workflow||!Array.isArray(workflow.steps))throw new Error("COMM_WORKFLOW_INVALID");
 if(state.cancelled)return{type:"exit",reason:"cancelled"};if(state.goal_achieved)return{type:"exit",reason:"goal_achieved"};if(state.consent_withdrawn)return{type:"exit",reason:"consent_withdrawn"};if(state.expires_at&&now>=new Date(state.expires_at))return{type:"exit",reason:"expired"};
 const step=workflow.steps[Number(state.step_index||0)];if(!step)return{type:"exit",reason:"completed"};
 if(step.type==="wait"){const due=new Date(state.step_started_at||now);due.setMinutes(due.getMinutes()+Number(step.minutes||0));return now<due?{type:"wait",until:due.toISOString()}:{type:"advance"}}
 if(step.type==="condition")return{type:"evaluate",condition:step.condition,on_true:step.on_true,on_false:step.on_false};
 if(step.type==="send")return{type:"send",template:step.template,channel:step.channel||"email"};if(step.type==="poll")return{type:"poll",poll:step.poll};if(step.type==="escalate")return{type:"escalate",target:step.target};return{type:"advance"};
}
export function simulateWorkflow({workflow,scenario={},max=100}){
 let state={step_index:0,step_started_at:"2026-01-01T09:00:00Z",...scenario},now=new Date(state.step_started_at);const timeline=[];
 for(let i=0;i<max;i++){const a=nextWorkflowAction({workflow,state,now});timeline.push({step:state.step_index,at:now.toISOString(),...a});if(a.type==="exit")break;if(a.type==="wait"){now=new Date(a.until)}state.step_index++;state.step_started_at=now.toISOString();if(scenario.goal_after_step===state.step_index)state.goal_achieved=true}return timeline;
}
