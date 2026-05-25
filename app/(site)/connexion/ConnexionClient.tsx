"use client";
import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLangue } from "@/contexts/LangueContext";
const cV={hidden:{},visible:{transition:{staggerChildren:0.04,delayChildren:0.05}}};
const lV={hidden:{opacity:0,y:20,rotateX:-70,scale:0.9},visible:{opacity:1,y:0,rotateX:0,scale:1,transition:{type:"spring" as const,stiffness:200,damping:18}}};
export default function ConnexionClient(){
  const {t}=useLangue();
  const router=useRouter();
  const searchParams=useSearchParams();
  const redirect=searchParams.get("redirect")||"/";
  const compteCree=searchParams.get("compte_cree")==="1";
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [erreur,setErreur]=useState("");
  const [loading,setLoading]=useState(false);
  useEffect(()=>{
    let aid:number;let renderer:any;
    const init=async()=>{
      const THREE=await import("three");
      const canvas=canvasRef.current;if(!canvas)return;
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(55,canvas.clientWidth/canvas.clientHeight,0.1,100);
      camera.position.z=4;
      renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
      renderer.setSize(canvas.clientWidth,canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
      const geo=new THREE.OctahedronGeometry(1.2,2);
      const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xc9a84c,metalness:0.95,roughness:0.05}));
      scene.add(mesh);
      const wire=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xc9a84c,wireframe:true,transparent:true,opacity:0.12}));
      wire.scale.setScalar(1.02);scene.add(wire);
      const r1=new THREE.Mesh(new THREE.TorusGeometry(2.0,0.01,8,100),new THREE.MeshBasicMaterial({color:0xc9a84c,transparent:true,opacity:0.2}));
      r1.rotation.x=Math.PI/4;scene.add(r1);
      const r2=new THREE.Mesh(new THREE.TorusGeometry(2.4,0.008,8,100),new THREE.MeshBasicMaterial({color:0xc9a84c,transparent:true,opacity:0.12}));
      r2.rotation.x=-Math.PI/3;r2.rotation.y=Math.PI/5;scene.add(r2);
      scene.add(new THREE.AmbientLight(0xffffff,0.25));
      const l1=new THREE.PointLight(0xc9a84c,3,12);l1.position.set(4,3,3);scene.add(l1);
      const l2=new THREE.PointLight(0x6644ff,1.2,10);l2.position.set(-4,-2,2);scene.add(l2);
      const pGeo=new THREE.BufferGeometry();
      const pos=new Float32Array(150*3);
      for(let i=0;i<450;i++)pos[i]=(Math.random()-0.5)*10;
      pGeo.setAttribute("position",new THREE.BufferAttribute(pos,3));
      scene.add(new THREE.Points(pGeo,new THREE.PointsMaterial({color:0xc9a84c,size:0.022,transparent:true,opacity:0.6})));
      const clock=new THREE.Clock();
      const animate=()=>{
        aid=requestAnimationFrame(animate);
        const e=clock.getElapsedTime();
        mesh.rotation.y=e*0.22;mesh.rotation.x=Math.sin(e*0.18)*0.25;
        wire.rotation.y=e*0.22;wire.rotation.x=Math.sin(e*0.18)*0.25;
        r1.rotation.z=e*0.1;r2.rotation.y=e*0.08;
        renderer.render(scene,camera);
      };animate();
      const onResize=()=>{if(!canvas||!renderer)return;camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix();renderer.setSize(canvas.clientWidth,canvas.clientHeight);};
      window.addEventListener("resize",onResize);
      return()=>window.removeEventListener("resize",onResize);
    };
    init();
    return()=>{if(aid)cancelAnimationFrame(aid);if(renderer)renderer.dispose();};
  },[]);
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();setLoading(true);setErreur("");
    const result=await signIn("credentials",{email:email.trim().toLowerCase(),password,loginType:"client",userAgent:navigator.userAgent,redirect:false});
    setLoading(false);
    if(result?.error){
      if(result.error.startsWith("BLOQUE:"))setErreur(`${t("trop_tentatives")} ${result.error.split(":")[1]} min.`);
      else if(result.error==="CLIENT_ONLY")setErreur(t("compte_non_client"));
      else setErreur(t("identifiants_incorrects"));
    }else if(result?.ok){router.push(redirect);router.refresh();}
    else setErreur(t("erreur_connexion"));
  };
  const g1={background:"linear-gradient(135deg,#C9A84C 0%,#F0D080 45%,#C9A84C 100%)",WebkitBackgroundClip:"text" as const,WebkitTextFillColor:"transparent" as const,backgroundClip:"text" as const};
  const g2={background:"linear-gradient(135deg,#F0D080 0%,#C9A84C 50%,#E8C060 100%)",WebkitBackgroundClip:"text" as const,WebkitTextFillColor:"transparent" as const,backgroundClip:"text" as const};
  return(
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{background:"linear-gradient(135deg,#080808 0%,#0a0a0a 55%,#0d0b08 100%)"}}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{opacity:0.5,pointerEvents:"none"}}/>
      <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 65% 55% at 50% 50%,rgba(201,168,76,0.06) 0%,transparent 70%)"}}/>
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8" style={{perspective:"600px"}}>
          <motion.div variants={cV} initial="hidden" animate="visible" className="flex flex-wrap justify-center mb-0.5">
            {"ÉTABLISSEMENT".split("").map((l,i)=>(
              <motion.span key={i} variants={lV} className="font-playfair font-bold text-2xl sm:text-3xl inline-block" style={{...g1,lineHeight:1.15}}>{l===" "?"\u00A0":l}</motion.span>
            ))}
          </motion.div>
          <motion.div variants={cV} initial="hidden" animate="visible" className="flex flex-wrap justify-center mb-4">
            {"TCHIBANVUNYA".split("").map((l,i)=>(
              <motion.span key={i} variants={lV} className="font-playfair font-bold text-2xl sm:text-3xl inline-block" style={{...g2,lineHeight:1.15}}>{l}</motion.span>
            ))}
          </motion.div>
          <motion.div initial={{scaleX:0}} animate={{scaleX:1}} transition={{duration:0.7,delay:0.6}} className="mx-auto h-px w-20 origin-center mb-4" style={{background:"linear-gradient(90deg,transparent,#C9A84C,transparent)"}}/>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}} className="text-sm font-medium" style={{color:"rgba(201,168,76,0.5)",letterSpacing:"0.1em"}}>{t("connexion_client_sous_titre")}</motion.p>
        </div>
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="rounded-2xl p-8"
          style={{background:"rgba(12,12,12,0.88)",border:"1px solid rgba(201,168,76,0.15)",backdropFilter:"blur(20px)",boxShadow:"0 24px 60px rgba(0,0,0,0.6),inset 0 1px 0 rgba(201,168,76,0.08)"}}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{color:"rgba(201,168,76,0.6)"}}>{t("votre_email")}</label>
              <input type="email" required autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
                style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(201,168,76,0.2)",color:"#F5F0E8",outline:"none"}}
                onFocus={(e)=>{e.target.style.border="1px solid rgba(201,168,76,0.6)";e.target.style.boxShadow="0 0 0 3px rgba(201,168,76,0.08)";}}
                onBlur={(e)=>{e.target.style.border="1px solid rgba(201,168,76,0.2)";e.target.style.boxShadow="none";}}/>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{color:"rgba(201,168,76,0.6)"}}>{t("mot_de_passe")}</label>
              <div className="relative">
                <input type={showPassword?"text":"password"} required autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all duration-200"
                  style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(201,168,76,0.2)",color:"#F5F0E8",outline:"none"}}
                  onFocus={(e)=>{e.target.style.border="1px solid rgba(201,168,76,0.6)";e.target.style.boxShadow="0 0 0 3px rgba(201,168,76,0.08)";}}
                  onBlur={(e)=>{e.target.style.border="1px solid rgba(201,168,76,0.2)";e.target.style.boxShadow="none";}}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                  style={{color:"rgba(201,168,76,0.4)"}}
                  onMouseEnter={(e)=>(e.currentTarget.style.color="#C9A84C")}
                  onMouseLeave={(e)=>(e.currentTarget.style.color="rgba(201,168,76,0.4)")}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {showPassword
                      ?<path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                      :<><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>
            {compteCree&&!erreur&&(
              <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} className="rounded-xl px-4 py-3" style={{background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.25)"}}>
                <p className="text-green-400 text-sm">Compte créé ! Connectez-vous avec votre email et mot de passe.</p>
              </motion.div>
            )}
            {erreur&&(
              <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} className="rounded-xl px-4 py-3" style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)"}}>
                <p className="text-red-400 text-sm">{erreur}</p>
              </motion.div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
              style={{background:loading?"rgba(201,168,76,0.5)":"linear-gradient(135deg,#C9A84C 0%,#E8C060 50%,#C9A84C 100%)",color:"#0A0A0A",boxShadow:loading?"none":"0 4px 20px rgba(201,168,76,0.3)"}}
              onMouseEnter={(e)=>{if(!loading)e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={(e)=>{e.currentTarget.style.transform="translateY(0)";}}>
              {loading?<span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{t("chargement")}</span>:t("se_connecter")}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{color:"rgba(245,240,232,0.35)"}}>
            {t("pas_de_compte")}{" "}
            <Link href={`/inscription?redirect=${encodeURIComponent(redirect)}`} className="font-medium" style={{color:"#C9A84C"}}>{t("creer_compte")}</Link>
          </p>
        </motion.div>
        <p className="text-center mt-5">
          <Link href="/" className="text-sm transition-colors duration-200" style={{color:"rgba(201,168,76,0.35)"}}
            onMouseEnter={(e)=>(e.currentTarget.style.color="#C9A84C")}
            onMouseLeave={(e)=>(e.currentTarget.style.color="rgba(201,168,76,0.35)")}>
            ← Retour à l'accueil
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
