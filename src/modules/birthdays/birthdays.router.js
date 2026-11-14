import { router } from '../../core/router/router.js'
export function registerRoutesBirthdays() {
  router.register('cumpleaneros',async(container,params)=>{
    const { renderBirthdaysView }=await import('./views/birthdaysView.js')
    return renderBirthdaysView(container,params)
  })
}
